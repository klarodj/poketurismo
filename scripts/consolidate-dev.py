#!/usr/bin/env python3
"""Retire only the verified legacy deployment; keep the existing 5174 playtest."""
import argparse
import base64
import errno
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import shlex
import shutil
import socket
import subprocess
import tempfile
from datetime import datetime, timezone
from urllib.error import HTTPError, URLError
from urllib.request import HTTPRedirectHandler, ProxyHandler, Request, build_opener

from database import backup

PUBLIC_URL = 'https://server-klaro.tail6c534c.ts.net:8443'
SERVICES = ('webapp-frontend', 'webapp-backend')
RETIRED = '# Poketurismo legacy updater retired by consolidate-dev.py\n'
STUB = '#!/usr/bin/env bash\n' + RETIRED + "echo 'Aggiornamento legacy disattivato: usare /home/klaro/poketurismo-work.'\nexit 0\n"


class Stop(RuntimeError):
    pass


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise Stop('Redirect inatteso nel controllo del playtest; nessuna credenziale viene inoltrata.')


def run(args, timeout=30):
    result = subprocess.run(args, capture_output=True, timeout=timeout)
    if result.returncode:
        # Do not echo arbitrary command output: Docker configurations can contain secrets.
        raise Stop(f'Comando non riuscito: {args[0]} {args[1] if len(args) > 1 else ""}. Controllare accessi e stato dal terminale del server.')
    return result.stdout.decode()


def atomic_write(path, content, previous=None, mode=0o600):
    if path.is_symlink() or (previous is not None and path.read_bytes() != previous):
        raise Stop(f'File modificato o collegamento inatteso: {path}')
    fd, temporary = tempfile.mkstemp(prefix=f'.{path.name}.', dir=path.parent)
    try:
        os.fchmod(fd, mode)
        with os.fdopen(fd, 'wb') as stream:
            stream.write(content)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def retired_compose(content):
    text = content.decode()
    names = re.findall(r'^  ([\w-]+):[ \t]*$', text, re.M)
    if names != list(SERVICES):
        raise Stop('Compose legacy inatteso: consentiti soltanto frontend e backend verificati.')
    policies = re.findall(r'^    restart: ([^\r\n]+)$', text, re.M)
    if len(policies) != 2 or any(p.strip('"\' ') not in ('unless-stopped', 'no') for p in policies):
        raise Stop('Politiche di riavvio Compose inattese: nessuna modifica automatica.')
    return re.sub(r'^(    restart: )[^\r\n]+$', r'\g<1>"no"', text, flags=re.M).encode()


class Consolidation:
    def __init__(self, root):
        self.root = Path(root).resolve()
        self.home = self.root.parent
        self.legacy = self.home / 'docker-server/webapp'
        self.compose = self.legacy / 'docker-compose.yml'
        self.updater = self.home / 'scripts/update_poketurismo.sh'
        self.archives = self.home / '.backups/poketurismo'
        self.archive = None
        self.stage = 'preflight'
        self.docker = ['docker']

    def docker_access(self):
        try:
            run(['docker', 'info', '--format', '{{.ServerVersion}}'])
        except Stop:
            if os.geteuid() == 0:
                raise
            # The host terminal can request sudo; no elevation is attempted by the agent.
            subprocess.run(['sudo', '-v'], check=True)
            self.docker = ['sudo', '-n', 'docker']
            run(self.docker + ['info', '--format', '{{.ServerVersion}}'])

    def updater_processes(self):
        processes = run(['ps', '-eo', 'pid=,args='])
        found = []
        for line in processes.splitlines():
            parts = line.strip().split(maxsplit=1)
            if len(parts) < 2:
                continue
            try:
                args = shlex.split(parts[1])
            except ValueError:
                continue
            # Include shell -c arguments, where the script may be followed by redirections.
            tokens = list(args)
            for argument in args:
                try:
                    tokens.extend(shlex.shlex(argument, posix=True, punctuation_chars=True))
                except ValueError:
                    pass
            if str(self.updater) in tokens:
                found.append(parts[0])
        if found:
            raise Stop('Aggiornamento legacy ancora in esecuzione (PID ' + ', '.join(found) + '). Attendere il termine e ripetere.')

    def inspect(self):
        containers = json.loads(run(self.docker + ['inspect', *SERVICES]))
        if len(containers) != 2:
            raise Stop('Attesi esattamente due container legacy.')
        for container, name, port in zip(containers, SERVICES, (5173, 3001)):
            labels = container.get('Config', {}).get('Labels') or {}
            files = labels.get('com.docker.compose.project.config_files', '').split(',')
            mounts = container.get('Mounts', [])
            ports = container.get('HostConfig', {}).get('PortBindings') or {}
            if (container.get('Name') != '/' + name or
                    labels.get('com.docker.compose.service') != name or
                    str(self.compose) not in files or
                    labels.get('com.docker.compose.project.working_dir') != str(self.legacy) or
                    not any(m.get('Source') == str(self.legacy / 'app') and m.get('Destination') == '/app' for m in mounts) or
                    not any(p.get('HostPort') == str(port) for p in ports.get(f'{port}/tcp', []))):
                raise Stop(f'Identità o collegamenti inattesi per {name}: nessun arresto automatico.')
        return containers

    def http(self, url, authorization=None):
        request = Request(url, headers={'Authorization': authorization} if authorization else {})
        opener = build_opener(ProxyHandler({}), NoRedirect())
        try:
            with opener.open(request, timeout=10) as response:
                return response.status, response.read(1024 * 1024)
        except HTTPError as error:
            with error:
                return error.code, error.read(1024)
        except (URLError, OSError) as error:
            reason = getattr(error, 'reason', error)
            hint = (' Verificare `tailscale funnel status` e l\'inoltro HTTPS 8443 verso '
                    'http://127.0.0.1:5184; non usare `tailscale funnel reset`.') if url.startswith(PUBLIC_URL + '/') else ''
            raise Stop(f'Connessione fallita a {url}: {reason}.{hint}') from None

    def health(self, url, authorization=None):
        status, content = self.http(url, authorization)
        if status != 200:
            raise Stop('Il controllo di salute non risponde 200: ' + url)
        data = json.loads(content)
        if data.get('ok') is not True or data.get('service') != 'poketurismo' or data.get('version') != 2:
            raise Stop('Il servizio non è la versione attesa di Poketurismo: ' + url)

    def availability(self):
        for service in ('poketurismo-dev', 'poketurismo-public'):
            if run(['systemctl', 'is-active', service]).strip() != 'active':
                raise Stop(f'{service} non è attivo.')
            if run(['systemctl', 'is-enabled', service]).strip() != 'enabled':
                raise Stop(f'{service} non è abilitato al boot.')
        self.health('http://127.0.0.1:5174/api/health')
        access = json.loads((self.root / '.preview/public-access.json').read_text())
        if not access.get('username') or not access.get('password'):
            raise Stop('Credenziali del playtest mancanti.')
        authorization = 'Basic ' + base64.b64encode(f'{access["username"]}:{access["password"]}'.encode()).decode()
        expected = (self.root / '.preview/public-dist/index.html').read_bytes()
        # Distinguish gateway failures from TLS/Funnel failures before any legacy mutation.
        for origin in ('http://127.0.0.1:5184', PUBLIC_URL):
            for path in ('/', '/api/health'):
                if self.http(origin + path)[0] != 401:
                    raise Stop('Il gateway non richiede le credenziali: ' + origin + path)
            self.health(origin + '/api/health', authorization)
            status, page = self.http(origin + '/', authorization)
            if status != 200 or hashlib.sha256(page).digest() != hashlib.sha256(expected).digest():
                raise Stop('La pagina non corrisponde alla build del playtest: ' + origin)
            print(f'Gateway, autenticazione e build verificati: {origin}', flush=True)

    def preflight(self):
        self.availability()
        self.updater_processes()
        for file in (self.compose, self.updater):
            if not file.is_file() or file.is_symlink():
                raise Stop(f'Configurazione assente o collegamento inatteso: {file}')
        self.compose_before = self.compose.read_bytes()
        self.compose_after = retired_compose(self.compose_before)
        self.updater_before = self.updater.read_bytes()
        if RETIRED.encode() not in self.updater_before and (b'git reset --hard' not in self.updater_before or str(self.legacy / 'app').encode() not in self.updater_before):
            raise Stop('Script di aggiornamento inatteso: non sovrascrivere modifiche locali.')
        for source in (self.root / '.preview/game.db', self.legacy / 'app/server/prisma/dev.db'):
            if not source.is_file():
                raise Stop(f'Salvataggio mancante: {source}')
        if run(['git', '-C', str(self.root), 'status', '--porcelain']).strip():
            raise Stop('Salvare prima le modifiche di sviluppo in un commit Git.')
        self.containers = self.inspect()

    def record(self, **extra):
        data = {'stage': self.stage, 'archive': str(self.archive), 'instance': 'http://127.0.0.1:5174',
                'time': datetime.now(timezone.utc).isoformat(), **extra}
        if self.archive:
            atomic_write(self.archive / 'status.json', json.dumps(data, indent=2).encode())
        atomic_write(self.root / '.preview/consolidation.json', json.dumps(data, indent=2).encode())

    def save(self):
        self.archives.mkdir(parents=True, exist_ok=True)
        self.archive = Path(tempfile.mkdtemp(prefix='consolidamento-', dir=self.archives))
        os.chmod(self.archive, 0o700)
        print(f'Backup e stato: {self.archive}', flush=True)
        backup(self.root / '.preview/game.db', self.archive / 'development.db')
        backup(self.legacy / 'app/server/prisma/dev.db', self.archive / 'legacy-before-stop.db')
        for source, name in ((self.compose, 'legacy-compose.yml'), (self.updater, 'update_poketurismo.sh')):
            shutil.copyfile(source, self.archive / name)
            os.chmod(self.archive / name, 0o600)
        patch = run(['git', '-C', str(self.legacy / 'app'), 'diff', '--binary', 'HEAD'])
        atomic_write(self.archive / 'legacy-local-changes.patch', patch.encode())
        self.stage = 'backups-verified'
        self.record()

    def ports_free(self):
        for port in (5173, 3001):
            for address, family in (('127.0.0.1', socket.AF_INET), ('::1', socket.AF_INET6)):
                try:
                    with socket.socket(family, socket.SOCK_STREAM) as connection:
                        connection.settimeout(2)
                        result = connection.connect_ex((address, port))
                except OSError as error:
                    if family == socket.AF_INET6 and error.errno == errno.EAFNOSUPPORT:
                        continue
                    raise
                if result != errno.ECONNREFUSED:
                    raise Stop(f'Porta {address}:{port} ancora occupata o non verificabile (codice {result}).')

    def apply(self):
        # Keep a process lock across checks, backups and mutations, including concurrent invocations.
        with (self.root / '.preview/consolidation.lock').open('a') as lock:
            try:
                fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
            except BlockingIOError:
                raise Stop('Un consolidamento è già in esecuzione.') from None
            self.preflight()
            self.save()
            self.stage = 'retiring-updater'
            self.record()
            atomic_write(self.updater, STUB.encode(), previous=self.updater_before, mode=self.updater.stat().st_mode & 0o777)
            # A cron invocation racing with the replacement must finish before any container is stopped.
            self.updater_processes()
            atomic_write(self.compose, self.compose_after, previous=self.compose_before, mode=self.compose.stat().st_mode & 0o777)
            self.stage = 'stopping-legacy'
            self.record()
            # Recheck identities immediately before mutations and act on immutable container IDs.
            current = self.inspect()
            ids = [item['Id'] for item in self.containers]
            if ids != [item['Id'] for item in current]:
                raise Stop('Container ricreati durante la preparazione: ripetere i controlli.')
            run(self.docker + ['update', '--restart=no', *ids])
            run(self.docker + ['stop', '--time', '20', *ids], timeout=60)
            backup(self.legacy / 'app/server/prisma/dev.db', self.archive / 'legacy-final.db')
            self.stage = 'verifying'
            self.record()
            for container in self.inspect():
                if container['State']['Running'] or container['HostConfig']['RestartPolicy']['Name'] != 'no':
                    raise Stop('Un container legacy è ancora attivo o ha il riavvio abilitato.')
            self.ports_free()
            self.availability()
            self.stage = 'complete'
            self.record(legacyContainersStopped=True, legacyUpdaterRetired=True,
                        postgresMigrated=False, personalAccountsImplemented=False)
            print('Consolidamento verificato: unica partita sulla 5174, gateway pubblico conservato.', flush=True)
            print('Il vecchio job, se ancora pianificato, ora esegue soltanto uno script senza operazioni.', flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true', help='Dopo i controlli, esegue backup e dismissione legacy. Senza opzione verifica soltanto.')
    args = parser.parse_args()
    task = Consolidation(Path(__file__).resolve().parents[1])
    try:
        task.docker_access()
        if args.apply:
            task.apply()
        else:
            task.preflight()
            print('Controlli riusciti. Per consolidare: python3 scripts/consolidate-dev.py --apply')
    except (Stop, OSError, ValueError, subprocess.SubprocessError) as error:
        if task.archive:
            try:
                task.record(failed=True)
            except OSError:
                print('Impossibile aggiornare il rapporto: controllare lo spazio su disco.', flush=True)
        print(f'Interrotto nella fase {task.stage}: {error}', flush=True)
        if task.archive:
            print(f'Backup e stato conservati in {task.archive}. Non sono stati rimossi dati o checkout.', flush=True)
        raise SystemExit(1) from None


if __name__ == '__main__':
    main()
