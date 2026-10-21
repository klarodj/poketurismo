#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?Imposta DATABASE_URL con un percorso file SQLite assoluto}"
case "$DATABASE_URL" in
  file:/*) DATABASE_PATH="${DATABASE_URL#file:}" ;;
  *) echo 'DATABASE_URL deve essere file:/percorso/assoluto/game.db' >&2; exit 1 ;;
esac
python3 scripts/database.py migrate "$DATABASE_PATH"
exec node server/index.js
