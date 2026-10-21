#!/usr/bin/env bash
set -euo pipefail
PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ "$PROJECT_DIR" != /home/klaro/poketurismo-work ]]; then
  echo 'Il servizio preparato usa /home/klaro/poketurismo-work: aggiornare i percorsi prima di installarlo altrove.' >&2
  exit 1
fi
sudo ufw allow 5174/tcp
sudo install -m 0644 "$PROJECT_DIR/deploy/poketurismo-dev.service" /etc/systemd/system/poketurismo-dev.service
sudo systemctl daemon-reload
sudo systemctl enable poketurismo-dev.service
# Re-running setup also restarts an already enabled service with the latest unit.
sudo systemctl restart poketurismo-dev.service
sudo systemctl status poketurismo-dev.service --no-pager
echo 'Servizio di sviluppo abilitato anche al boot. Indirizzo: http://IP_DEL_SERVER:5174'
echo 'Log: sudo journalctl -u poketurismo-dev -f'
