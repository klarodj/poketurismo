import contextlib
import io
from pathlib import Path
import shutil
import sqlite3
import tempfile
import unittest
import database

class DatabaseTest(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name)
        self.db = self.root / 'game.db'
    def tearDown(self):
        self.temporary.cleanup()
    def migrate(self):
        with contextlib.redirect_stdout(io.StringIO()):
            database.migrate(self.db)
    def test_existing_legacy_database_migrates_without_losing_balances_or_cars(self):
        baseline = (database.MIGRATIONS / '0001_baseline/migration.sql').read_text()
        with sqlite3.connect(self.db) as connection:
            connection.executescript(baseline)
            connection.execute('DROP TABLE ChampionshipEntry')
            connection.execute('INSERT INTO User (id,username,password,mail,money,brave,clean,reflex,acro,turn,brake,throttle,shift,carDrive) VALUES (1,?,?,?,?,0,0,0,0,0,0,0,0,0)', ('legacy', 'secret', '', 1234))
        self.migrate()
        self.migrate()
        with sqlite3.connect(self.db) as connection:
            self.assertEqual(connection.execute('SELECT moneyCents FROM User').fetchone()[0], 123400)
            self.assertEqual(connection.execute('SELECT count(*) FROM ChampionshipEntry').fetchone()[0], 0)
            self.assertEqual(connection.execute('SELECT count(*) FROM _GameMigrations').fetchone()[0], len(list(database.MIGRATIONS.glob('*/migration.sql'))))
            database.check(connection)
        self.assertGreater(len(list((self.root / 'backups').glob('*.db'))), 0)
    def test_backup_and_restore_include_committed_wal_and_reject_overwrites(self):
        connection = sqlite3.connect(self.db)
        try:
            connection.execute('PRAGMA journal_mode=WAL')
            connection.execute('CREATE TABLE data(value INTEGER)')
            connection.execute('INSERT INTO data VALUES (42)')
            connection.commit()
            saved, restored = self.root / 'backup.db', self.root / 'restored.db'
            database.backup(self.db, saved)
            database.backup(saved, restored)
            with sqlite3.connect(restored) as read:
                self.assertEqual(read.execute('SELECT value FROM data').fetchone()[0], 42)
            with self.assertRaises(ValueError):
                database.backup(saved, restored)
            with self.assertRaises(ValueError):
                database.backup(self.db, self.db)
        finally:
            connection.close()
    def test_invalid_migration_rolls_back_all_schema_changes(self):
        original = database.MIGRATIONS
        local = self.root / 'migrations'
        shutil.copytree(original, local)
        broken = local / '9999_failure'
        broken.mkdir()
        (broken / 'migration.sql').write_text('CREATE TABLE temporary_change (id INTEGER);\nINVALID SQL;\n')
        database.MIGRATIONS = local
        try:
            with self.assertRaises(sqlite3.Error):
                self.migrate()
            with sqlite3.connect(self.db) as connection:
                self.assertEqual(connection.execute("SELECT count(*) FROM sqlite_master WHERE type='table'").fetchone()[0], 0)
        finally:
            database.MIGRATIONS = original
    def test_driver_progression_has_database_bounds_without_changing_pilot_stats(self):
        self.migrate()
        with sqlite3.connect(self.db) as connection:
            connection.execute("INSERT INTO User (id,username,password,mail,brave,clean,reflex,acro,turn,brake,throttle,shift,carDrive) VALUES (1,'pilot','','',0,0,0,0,0,17,0,0,0)")
            connection.execute('INSERT INTO DriverDevelopment (userId) VALUES (1)')
            self.assertEqual(connection.execute('SELECT referencePractice,lessonPassed FROM DriverDevelopment').fetchone(), (0, 0))
            with self.assertRaises(sqlite3.IntegrityError):
                connection.execute('UPDATE DriverDevelopment SET referencePractice=121 WHERE userId=1')
            with self.assertRaises(sqlite3.IntegrityError):
                connection.execute('UPDATE DriverDevelopment SET techniquePractice=-1 WHERE userId=1')
            self.assertEqual(connection.execute('SELECT brake FROM User WHERE id=1').fetchone()[0], 17)
            database.check(connection)
    def test_modified_applied_migration_is_rejected(self):
        self.migrate()
        original = database.MIGRATIONS
        local = self.root / 'migrations'
        shutil.copytree(original, local)
        target = local / '0002_persistence/migration.sql'
        target.write_text(target.read_text() + '\n-- unexpected edit\n')
        database.MIGRATIONS = local
        try:
            with self.assertRaisesRegex(RuntimeError, 'modificata'):
                self.migrate()
        finally:
            database.MIGRATIONS = original

if __name__ == '__main__':
    unittest.main()
