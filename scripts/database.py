#!/usr/bin/env python3
"""SQLite backups and versioned SQL migrations. Never defaults to the live database."""
import argparse
import hashlib
import os
from pathlib import Path
import sqlite3
import tempfile
from datetime import datetime, timezone

MIGRATIONS = Path(__file__).resolve().parents[1] / 'server/prisma/migrations'

def check(connection):
    if connection.execute('PRAGMA integrity_check').fetchone()[0] != 'ok':
        raise RuntimeError('SQLite integrity check failed')
    violations = connection.execute('PRAGMA foreign_key_check').fetchall()
    if violations:
        raise RuntimeError(f'Foreign key violations: {violations[:5]}')

def backup(source, destination):
    source, destination = Path(source).resolve(), Path(destination).resolve()
    if source == destination or destination.exists():
        raise ValueError('Il backup deve usare un nuovo file distinto dal database sorgente')
    destination.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary = tempfile.mkstemp(dir=destination.parent, suffix='.db')
    os.close(fd)
    try:
        with sqlite3.connect(source.as_uri() + '?mode=ro', uri=True, timeout=30) as original:
            with sqlite3.connect(temporary) as target:
                original.backup(target)
                check(target)
        os.replace(temporary, destination)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)

def statements(sql):
    pending = ''
    for line in sql.splitlines(keepends=True):
        pending += line
        if sqlite3.complete_statement(pending):
            yield pending
            pending = ''
    if pending.strip():
        # A trailing SQL comment has no executable statement.
        if any(line.strip() and not line.lstrip().startswith('--') for line in pending.splitlines()):
            raise ValueError('Incomplete migration SQL')

def migrate(database):
    database = Path(database).resolve()
    database.parent.mkdir(parents=True, exist_ok=True)
    if database.exists():
        stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
        destination = database.parent / 'backups' / f'{database.stem}-{stamp}.db'
        backup(database, destination)
        print(f'Backup: {destination}')
    with sqlite3.connect(database, timeout=30) as connection:
        connection.execute('PRAGMA foreign_keys=OFF')
        connection.execute('BEGIN IMMEDIATE')
        try:
            connection.execute('CREATE TABLE IF NOT EXISTS _GameMigrations (version TEXT PRIMARY KEY, checksum TEXT NOT NULL)')
            for directory in sorted(path for path in MIGRATIONS.iterdir() if path.is_dir()):
                sql = (directory / 'migration.sql').read_text()
                checksum = hashlib.sha256(sql.encode()).hexdigest()
                previous = connection.execute('SELECT checksum FROM _GameMigrations WHERE version=?', (directory.name,)).fetchone()
                if previous:
                    if previous[0] != checksum:
                        raise RuntimeError(f'Migrazione già applicata modificata: {directory.name}')
                    continue
                if directory.name == '0001_baseline':
                    # Complete missing legacy tables without replacing any existing data.
                    sql = sql.replace('CREATE TABLE ', 'CREATE TABLE IF NOT EXISTS ').replace('CREATE UNIQUE INDEX ', 'CREATE UNIQUE INDEX IF NOT EXISTS ').replace('CREATE INDEX ', 'CREATE INDEX IF NOT EXISTS ')
                for statement in statements(sql):
                    if statement.lstrip().upper().startswith('PRAGMA '):
                        continue
                    # Generated SQL may put a comment before a PRAGMA.
                    executable = '\n'.join(line for line in statement.splitlines() if not line.lstrip().startswith('--')).strip()
                    if executable.upper().startswith('PRAGMA '):
                        continue
                    connection.execute(statement)
                connection.execute('INSERT INTO _GameMigrations VALUES (?, ?)', (directory.name, checksum))
                print(f'Migrazione applicata: {directory.name}')
            check(connection)
            connection.commit()
        except BaseException:
            connection.rollback()
            raise
        connection.execute('PRAGMA foreign_keys=ON')

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['migrate', 'backup', 'restore'])
    parser.add_argument('source', type=Path)
    parser.add_argument('destination', nargs='?', type=Path)
    args = parser.parse_args()
    if args.action == 'migrate':
        migrate(args.source)
    else:
        if args.destination is None:
            parser.error('Specificare un nuovo file destinazione; il ripristino non sovrascrive file esistenti')
        backup(args.source, args.destination)
        print(f'{args.action}: {args.destination}')

if __name__ == '__main__':
    main()
