import importlib.util
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('dev_supervisor', Path(__file__).with_name('dev-supervisor.py'))
supervisor = importlib.util.module_from_spec(spec)
spec.loader.exec_module(supervisor)

class SupervisorTest(unittest.TestCase):
    def test_sources_build_and_restart_signal_trigger_changes_but_runtime_data_does_not(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'server/prisma').mkdir(parents=True)
            (root / '.preview').mkdir()
            initial = supervisor.fingerprint(root)
            (root / 'server/prisma/game.db').write_text('save')
            (root / 'server/prisma/game.db-wal').write_text('wal')
            self.assertEqual(supervisor.fingerprint(root), initial)
            (root / 'server/index.js').write_text('source')
            source = supervisor.fingerprint(root)
            self.assertNotEqual(source, initial)
            (root / 'dist').mkdir()
            (root / 'dist/index.html').write_text('build')
            built = supervisor.fingerprint(root)
            self.assertNotEqual(built, source)
            (root / '.preview/restart.request').write_text('restart')
            self.assertNotEqual(supervisor.fingerprint(root), built)
    def test_dependency_changes_are_not_watched(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'server/node_modules/library').mkdir(parents=True)
            initial = supervisor.fingerprint(root)
            (root / 'server/node_modules/library/index.js').write_text('dependency')
            self.assertEqual(supervisor.fingerprint(root), initial)
            (root / 'server/generated/postgres').mkdir(parents=True)
            (root / 'server/generated/postgres/index.js').write_text('generated client')
            self.assertEqual(supervisor.fingerprint(root), initial)

if __name__ == '__main__':
    unittest.main()
