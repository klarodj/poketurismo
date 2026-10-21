import copy
from contextlib import closing
import errno
import importlib.util
import json
from pathlib import Path
import sqlite3
import ssl
import tempfile
import unittest
from unittest.mock import patch
from urllib.error import URLError

spec = importlib.util.spec_from_file_location('consolidate_dev', Path(__file__).with_name('consolidate-dev.py'))
consolidate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(consolidate)


class ConsolidationTest(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name) / 'poketurismo-work'
        (self.root / '.preview/public-dist').mkdir(parents=True)
        self.task = consolidate.Consolidation(self.root)
        (self.task.legacy / 'app/server/prisma').mkdir(parents=True)
        self.task.updater.parent.mkdir()
        self.task.compose.write_text('services:\n  webapp-frontend:\n    restart: unless-stopped\n  webapp-backend:\n    restart: unless-stopped\n')
        self.task.updater.write_text(f'#!/bin/bash\nAPP_DIR="{self.task.legacy / "app"}"\ngit reset --hard @{{u}}\n')
        self.task.updater.chmod(0o755)
        self.sources = (self.root / '.preview/game.db', self.task.legacy / 'app/server/prisma/dev.db')
        for value, source in enumerate(self.sources, 42):
            with closing(sqlite3.connect(source)) as connection, connection:
                connection.execute('CREATE TABLE save(value INTEGER)')
                connection.execute('INSERT INTO save VALUES (?)', (value,))
        (self.root / '.preview/public-dist/index.html').write_bytes(b'<html>playtest</html>')
        (self.root / '.preview/public-access.json').write_text(json.dumps({'username': 'test', 'password': 'test-fixture'}))
        self.originals = {file: file.read_bytes() for file in (*self.sources, self.task.compose, self.task.updater)}
        self.containers = []
        for name, port in zip(consolidate.SERVICES, (5173, 3001)):
            self.containers.append({'Id': name + '-immutable-id', 'Name': '/' + name, 'Config': {'Labels': {
                'com.docker.compose.service': name,
                'com.docker.compose.project.config_files': str(self.task.compose),
                'com.docker.compose.project.working_dir': str(self.task.legacy)}},
                'Mounts': [{'Source': str(self.task.legacy / 'app'), 'Destination': '/app'}],
                'HostConfig': {'PortBindings': {f'{port}/tcp': [{'HostPort': str(port)}]}, 'RestartPolicy': {'Name': 'unless-stopped'}},
                'State': {'Running': True}})
        self.commands = []
        self.processes = ''
        self.unhealthy = False
        self.wrong_public_page = False
        self.fail_stop = False
        self.funnel = {}
        self.addCleanup(patch.stopall)
        patch.object(consolidate, 'run', side_effect=self.command).start()
        patch.object(self.task, 'http', side_effect=self.http).start()
        patch.object(self.task, 'ports_free').start()
        patch('builtins.print').start()

    def command(self, args, timeout=30):
        self.commands.append(args)
        if args[0] == 'systemctl':
            return 'active\n' if args[1] == 'is-active' else 'enabled\n'
        if args[0] == 'ps':
            return self.processes
        if args[:3] == ['tailscale', 'funnel', 'status']:
            return json.dumps(self.funnel)
        if args[0] == 'git':
            return '' if 'status' in args else 'saved legacy changes\n'
        if args[:2] == ['docker', 'inspect']:
            return json.dumps(self.containers)
        if args[:2] == ['docker', 'update']:
            self.assertEqual(args[3:], [item['Id'] for item in self.containers])
            for container in self.containers:
                container['HostConfig']['RestartPolicy']['Name'] = 'no'
            return ''
        if args[:2] == ['docker', 'stop']:
            if self.fail_stop:
                raise consolidate.Stop('stop failed')
            self.assertEqual(args[4:], [item['Id'] for item in self.containers])
            for container in self.containers:
                container['State']['Running'] = False
            return ''
        raise AssertionError(f'Unexpected command: {args}')

    def http(self, url, authorization=None):
        if url.startswith((consolidate.PUBLIC_URL, 'http://127.0.0.1:5184')) and not authorization:
            return 401, b'authentication required'
        if url.endswith('/api/health'):
            if self.unhealthy:
                return 502, b'not ready'
            return 200, b'{"ok":true,"service":"poketurismo","version":2}'
        return 200, b'wrong page' if self.wrong_public_page else b'<html>playtest</html>'

    def assert_no_mutations(self):
        self.assertFalse(any(args[:2] in (['docker', 'update'], ['docker', 'stop']) for args in self.commands))
        for file, content in self.originals.items():
            self.assertEqual(file.read_bytes(), content)

    def test_default_preflight_is_read_only_and_checks_public_endpoint(self):
        self.task.preflight()
        self.assert_no_mutations()
        self.assertFalse(self.task.archives.exists())
        self.task.http.assert_any_call(consolidate.PUBLIC_URL + '/api/health', unittest.mock.ANY)

    def test_funnel_still_using_legacy_on_443_prevents_container_shutdown(self):
        self.funnel = {'Web': {'server.ts.net:443': {'Handlers': {
            '/': {'Proxy': 'http://127.0.0.1:5173'}, '/api/': {'Proxy': 'http://127.0.0.1:3001/api'}}}}}
        with self.assertRaisesRegex(consolidate.Stop, 'Funnel usa ancora') as caught:
            self.task.apply()
        self.assertIn('443', str(caught.exception))
        self.assertIn('3001', str(caught.exception))
        self.assert_no_mutations()

    def test_gateway_routes_and_unrelated_apps_are_not_legacy_dependencies(self):
        config = {'Web': {'server.ts.net:8443': {'Handlers': {'/': {'Proxy': 'http://127.0.0.1:5184'}}},
                          'server.ts.net:10000': {'Handlers': {'/': {'Proxy': 'http://127.0.0.1:9000'}}}}}
        self.assertEqual(consolidate.legacy_routes(config), [])

    def test_foreground_legacy_routes_are_also_detected(self):
        config = {'Foreground': {'session': {'Web': {'server.ts.net:443': {'Handlers': {
            '/': {'Proxy': 'http://127.0.0.1:5173'}}}}}}}
        self.assertEqual(len(consolidate.legacy_routes(config)), 1)

    def test_unhealthy_primary_or_wrong_public_build_prevents_all_changes(self):
        for attribute in ('unhealthy', 'wrong_public_page'):
            with self.subTest(attribute=attribute):
                setattr(self, attribute, True)
                with self.assertRaises(consolidate.Stop):
                    self.task.apply()
                self.assert_no_mutations()
                setattr(self, attribute, False)

    def test_unexpected_container_identity_or_extra_compose_service_is_not_stopped(self):
        self.containers[0]['Mounts'][0]['Source'] = '/some-other-project'
        with self.assertRaises(consolidate.Stop):
            self.task.apply()
        self.assert_no_mutations()
        with self.assertRaises(consolidate.Stop):
            consolidate.retired_compose(self.task.compose.read_bytes() + b'  unrelated-service:\n    restart: unless-stopped\n')

    def test_running_updater_prevents_changes(self):
        for command in (f'/bin/bash {self.task.updater}', f'/bin/sh -c "{self.task.updater} >/dev/null 2>&1"'):
            with self.subTest(command=command):
                self.processes = f'123 {command}\n'
                with self.assertRaisesRegex(consolidate.Stop, '123'):
                    self.task.apply()
                self.assert_no_mutations()

    def test_failed_backup_leaves_updater_compose_and_containers_unchanged(self):
        with patch.object(consolidate, 'backup', side_effect=OSError('disk full')):
            with self.assertRaises(OSError):
                self.task.apply()
        self.assert_no_mutations()

    def test_success_archives_both_saves_retires_only_legacy_and_is_repeatable(self):
        initial = copy.deepcopy(self.containers)
        self.task.apply()
        archive = self.task.archive
        self.assertEqual((self.task.updater.stat().st_mode & 0o777), 0o755)
        self.assertIn(consolidate.RETIRED, self.task.updater.read_text())
        self.assertEqual(self.task.compose.read_bytes().count(b'restart: "no"'), 2)
        for file in self.sources:
            self.assertEqual(file.read_bytes(), self.originals[file])
        for name, value in [('development.db', 42), ('legacy-before-stop.db', 43), ('legacy-final.db', 43)]:
            with closing(sqlite3.connect(archive / name)) as connection:
                self.assertEqual(connection.execute('SELECT value FROM save').fetchone()[0], value)
        self.assertEqual((archive / 'update_poketurismo.sh').read_bytes(), self.originals[self.task.updater])
        self.assertEqual((archive / 'legacy-compose.yml').read_bytes(), self.originals[self.task.compose])
        self.assertEqual((archive.stat().st_mode & 0o777), 0o700)
        status = json.loads((self.root / '.preview/consolidation.json').read_text())
        self.assertEqual(status['stage'], 'complete')
        self.assertFalse(status['postgresMigrated'])
        self.assertFalse(status['personalAccountsImplemented'])
        self.assertTrue(all(not item['State']['Running'] for item in self.containers))
        self.assertTrue(all(item['Id'] == old['Id'] for item, old in zip(self.containers, initial)))
        self.task.apply()
        self.assertNotEqual(self.task.archive, archive)
        self.assertTrue((archive / 'legacy-final.db').is_file())

    def test_concurrent_change_to_updater_is_preserved(self):
        original_save = self.task.save
        def changed_save():
            original_save()
            self.task.updater.write_text('user change')
        with patch.object(self.task, 'save', side_effect=changed_save):
            with self.assertRaisesRegex(consolidate.Stop, 'File modificato'):
                self.task.apply()
        self.assertEqual(self.task.updater.read_text(), 'user change')
        self.assertFalse(any(args[:2] == ['docker', 'stop'] for args in self.commands))

    def test_failed_stop_keeps_backups_and_does_not_say_complete(self):
        self.fail_stop = True
        with self.assertRaisesRegex(consolidate.Stop, 'stop failed'):
            self.task.apply()
        self.assertTrue((self.task.archive / 'development.db').is_file())
        self.assertNotEqual(json.loads((self.task.archive / 'status.json').read_text())['stage'], 'complete')
        self.assertIn(consolidate.RETIRED, self.task.updater.read_text())

    def test_permission_denied_on_port_probe_is_not_treated_as_a_free_port(self):
        with patch.object(consolidate.socket, 'socket') as socket:
            socket.return_value.__enter__.return_value.connect_ex.return_value = errno.EACCES
            with self.assertRaises(consolidate.Stop):
                consolidate.Consolidation.ports_free(self.task)

    def test_tls_failure_identifies_public_url_without_exposing_credentials(self):
        url = consolidate.PUBLIC_URL + '/api/health'
        header = 'Basic private-test-header'
        with patch.object(consolidate, 'build_opener') as opener:
            opener.return_value.open.side_effect = URLError(ssl.SSLEOFError(8, 'UNEXPECTED_EOF_WHILE_READING'))
            with self.assertRaises(consolidate.Stop) as caught:
                consolidate.Consolidation.http(self.task, url, header)
        self.assertIn(url, str(caught.exception))
        self.assertIn('tailscale funnel status', str(caught.exception))
        self.assertNotIn(header, str(caught.exception))

    def test_public_tls_failure_does_not_retire_updater_or_stop_containers(self):
        original_http = self.http
        def public_unavailable(url, authorization=None):
            if url.startswith(consolidate.PUBLIC_URL):
                raise consolidate.Stop('Connessione fallita: TLS EOF')
            return original_http(url, authorization)
        self.task.http.side_effect = public_unavailable
        with self.assertRaisesRegex(consolidate.Stop, 'TLS EOF'):
            self.task.apply()
        self.task.http.assert_any_call('http://127.0.0.1:5184/api/health', unittest.mock.ANY)
        self.assert_no_mutations()


if __name__ == '__main__':
    unittest.main()
