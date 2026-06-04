#!/usr/bin/env sh
set -eu

if [ "${1:-}" = "" ]; then
  echo "Uso: scripts/restore-postgres.sh backups/archivo.sql"
  exit 1
fi

BACKUP_FILE="$1"
if [ ! -f "$BACKUP_FILE" ]; then
  echo "No existe el archivo: $BACKUP_FILE"
  exit 1
fi

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.postgres.yml}"
POSTGRES_SERVICE="${POSTGRES_SERVICE:-postgres}"

echo "Restaurando $BACKUP_FILE en PostgreSQL. Presiona Ctrl+C para cancelar."
sleep 3

cat "$BACKUP_FILE" | docker compose -f "$COMPOSE_FILE" exec -T "$POSTGRES_SERVICE" sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" "$POSTGRES_DB"'

echo "Restore finalizado."
