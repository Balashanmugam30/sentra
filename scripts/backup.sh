#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
OUTPUT_DIR="${OUTPUT_DIR:-backups}"
DB_NAME="${DB_NAME:-sentra}"
DB_USER="${DB_USER:-sentra}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

mkdir -p "$OUTPUT_DIR"
BACKUP_PATH="$OUTPUT_DIR/sentra-$(date +%Y%m%d-%H%M%S).sql"

docker compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_PATH"
find "$OUTPUT_DIR" -name "sentra-*.sql" -type f -mtime +"$RETENTION_DAYS" -delete

echo "Backup created: $BACKUP_PATH"
