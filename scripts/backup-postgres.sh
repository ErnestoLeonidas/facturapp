#!/usr/bin/env sh
set -eu

BACKUP_DIR="${BACKUP_DIR:-backups}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.postgres.yml}"
POSTGRES_SERVICE="${POSTGRES_SERVICE:-postgres}"
mkdir -p "$BACKUP_DIR"

STAMP="$(date +%Y%m%d%H%M%S)"
OUT="$BACKUP_DIR/${STAMP}-factuflow-postgres.sql"

docker compose -f "$COMPOSE_FILE" exec -T "$POSTGRES_SERVICE" sh -c 'pg_dump --clean --if-exists --no-owner --no-privileges -U "$POSTGRES_USER" "$POSTGRES_DB"' > "$OUT"

echo "Backup creado: $OUT"
