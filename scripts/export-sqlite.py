#!/usr/bin/env python3
"""Export one consistent read-only SQLite snapshot to stdout for the PostgreSQL importer."""
from contextlib import closing
import json
from pathlib import Path
import sqlite3
import sys

source = Path(sys.argv[1]).resolve()
with closing(sqlite3.connect(source.as_uri() + '?mode=ro', uri=True)) as connection:
    connection.row_factory = sqlite3.Row
    connection.execute('BEGIN')
    names = [row[0] for row in connection.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")]
    result = {}
    for name in names:
        identifier = '"' + name.replace('"', '""') + '"'
        result[name] = [dict(row) for row in connection.execute('SELECT * FROM ' + identifier)]
    print(json.dumps(result, allow_nan=False, separators=(',', ':')))
