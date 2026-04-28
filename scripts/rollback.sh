#!/usr/bin/env bash
set -euo pipefail

PREVIOUS_COLOR="${1:-green}"
COMPOSE_PROJECT_NAME="sentra-${PREVIOUS_COLOR}"

echo "Rolling traffic back to Sentra ${PREVIOUS_COLOR}."
COMPOSE_PROJECT_NAME="$COMPOSE_PROJECT_NAME" docker compose up -d
BASE_URL="${BASE_URL:-http://localhost}" scripts/smoke-test.sh
echo "Rollback target ${PREVIOUS_COLOR} is healthy."
