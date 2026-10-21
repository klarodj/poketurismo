#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?Imposta DATABASE_URL per il database preparato}"
case "$DATABASE_URL" in
  postgres://*|postgresql://*) exec node server/index.js ;;
  file:/*) DATABASE_PATH="${DATABASE_URL#file:}" ;;
  *) echo 'DATABASE_URL deve essere file:/percorso/assoluto/game.db' >&2; exit 1 ;;
esac
python3 scripts/database.py migrate "$DATABASE_PATH"
exec node server/index.js
