#!/usr/bin/env bash
# Optional replacement for reset --hard based update jobs. Does not deploy automatically.
set -euo pipefail
PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"
if [[ -n "$(git status --porcelain)" ]]; then
  echo 'Aggiornamento interrotto: ci sono modifiche locali da preservare.' >&2
  exit 1
fi
if git ls-files --error-unmatch server/prisma/dev.db >/dev/null 2>&1; then
  echo 'Aggiornamento interrotto: il database è ancora tracciato. Spostalo fuori dal checkout prima di integrare la nuova versione.' >&2
  exit 1
fi
git fetch origin
git merge --ff-only '@{u}'
echo 'Codice aggiornato senza reset forzato. Il database esterno non è stato modificato.'
