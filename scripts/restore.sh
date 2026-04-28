#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: scripts/restore.sh <backup.sql>" >&2
  exit 1
fi

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
DB_NAME="${DB_NAME:-sentra}"
DB_USER="${DB_USER:-sentra}"
BACKUP_PATH="$1"

if [[ ! -f "$BACKUP_PATH" ]]; then
  echo "Backup file not found: $BACKUP_PATH" >&2
  exit 1
fi

docker compose -f "$COMPOSE_FILE" exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" < "$BACKUP_PATH"
echo "Restore completed from: $BACKUP_PATH"
