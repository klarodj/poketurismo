#!/usr/bin/env bash
set -euo pipefail
PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"
PREVIEW_DIR="$PROJECT_DIR/.preview"
FRONTEND_PORT="${POKETURISMO_PREVIEW_PORT:-5174}"
mkdir -p "$PREVIEW_DIR"
if [[ ! -f "$PREVIEW_DIR/game.db" ]]; then
  python3 scripts/database.py backup /home/klaro/docker-server/webapp/app/server/prisma/dev.db "$PREVIEW_DIR/game.db"
fi
python3 scripts/database.py migrate "$PREVIEW_DIR/game.db"
if ! cmp -s server/prisma/schema.prisma server/node_modules/.prisma/client/schema.prisma; then
  DATABASE_URL="file:$PREVIEW_DIR/game.db" npm --prefix server run generate
fi
RUN_DIR="$(mktemp -d "$PREVIEW_DIR/run.XXXXXX")"
BACKEND_PID=''
cleanup() {
  if [[ -n "$BACKEND_PID" ]]; then
    kill "$BACKEND_PID" 2>/dev/null || true
    wait "$BACKEND_PID" 2>/dev/null || true
  fi
  rm -rf -- "$RUN_DIR"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
# Let the OS select a free backend port. Never reuse or stop an existing listener.
DATABASE_URL="file:$PREVIEW_DIR/game.db" HOST=127.0.0.1 PORT=0 POKETURISMO_READY_FILE="$RUN_DIR/ready.json" node server/index.js &
BACKEND_PID=$!
for attempt in {1..100}; do
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo 'Backend anteprima non avviato: controlla il messaggio di errore.' >&2
    exit 1
  fi
  if [[ -f "$RUN_DIR/ready.json" ]]; then
    break
  fi
  if [[ "$attempt" == 100 ]]; then
    echo 'Backend anteprima non pronto dopo 10 secondi.' >&2
    exit 1
  fi
  sleep 0.1
done
BACKEND_PORT="$(python3 - "$RUN_DIR/ready.json" "$BACKEND_PID" <<'PY'
import json, sys
with open(sys.argv[1]) as source:
    ready = json.load(source)
if ready.get('pid') != int(sys.argv[2]) or not isinstance(ready.get('port'), int) or not 0 < ready['port'] < 65536:
    raise SystemExit('Identità del backend di anteprima non valida')
print(ready['port'])
PY
)"
echo "Avvio frontend: http://localhost:$FRONTEND_PORT (da altro dispositivo: http://IP_DEL_SERVER:$FRONTEND_PORT)"
echo "Backend dedicato sulla porta $BACKEND_PORT; CTRL+C per fermare questa anteprima."
POKETURISMO_PREVIEW=1 POKETURISMO_API_TARGET="http://127.0.0.1:$BACKEND_PORT" VITE_API_BASE_URL=/api npm run dev -- --configLoader native --host 0.0.0.0 --port "$FRONTEND_PORT" --strictPort
