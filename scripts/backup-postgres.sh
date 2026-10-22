#!/usr/bin/env bash
# Full auth + game archive. Run as root (systemd); database credentials never enter argv.
set -euo pipefail
umask 077
if [[ "$EUID" != 0 ]]; then
  echo 'Eseguire il backup tramite sudo o poketurismo-backup.service.' >&2
  exit 1
fi
destination=/home/klaro/.backups/poketurismo/postgres
mkdir -p "$destination"
chmod 700 "$destination"
temporary=$(mktemp "$destination/.partial.XXXXXX")
trap 'rm -f -- "$temporary"' EXIT
runuser -u postgres -- pg_dump -h /var/run/postgresql -p 5434 -d poketurismo -Fc > "$temporary"
pg_restore --list "$temporary" > /dev/null
archive="$destination/poketurismo-$(date -u +%Y%m%dT%H%M%S%NZ).dump"
mv -- "$temporary" "$archive"
sha256sum "$archive" > "$archive.sha256"
echo "Backup completo Auth e gioco verificato: $archive"
