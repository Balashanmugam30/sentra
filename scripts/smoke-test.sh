#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost}"
API_BASE_URL="${API_BASE_URL:-$BASE_URL/api}"

check() {
  local url="$1"
  curl -fsS --max-time 20 "$url" >/dev/null
  echo "OK $url"
}

check "$BASE_URL/"
check "$API_BASE_URL/health"
check "$API_BASE_URL/system/health/deep"
check "$API_BASE_URL/system/metrics"
echo "Sentra smoke tests passed."
