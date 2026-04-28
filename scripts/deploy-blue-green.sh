#!/usr/bin/env bash
set -euo pipefail

COLOR="${1:-blue}"
COMPOSE_PROJECT_NAME="sentra-${COLOR}"
ENV_FILE="${ENV_FILE:-.env.production}"

echo "Deploying Sentra ${COLOR} stack with $ENV_FILE"
COMPOSE_PROJECT_NAME="$COMPOSE_PROJECT_NAME" docker compose --env-file "$ENV_FILE" up -d --build
BASE_URL="${BASE_URL:-http://localhost}" scripts/smoke-test.sh
echo "Sentra ${COLOR} stack healthy. Switch traffic at the load balancer/nginx upstream when ready."
