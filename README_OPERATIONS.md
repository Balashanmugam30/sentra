# Sentra Enterprise Operations Runbook

## Environments

Sentra supports `local`, `dev`, `staging`, and `production` through env files.

- Local: `.env.local` with frontend on `localhost:3000` and backend on `127.0.0.1:8000`.
- Staging: copy `.env.staging.template` to `.env.staging`.
- Production: copy `.env.production.template` to `.env.production`.

Never commit real secrets. Use GitHub Environments or a secret manager for production values.

## One-Command Platform

```bash
docker compose up --build
```

Frontend is served at `http://localhost`, backend at `http://localhost/api`, and Swagger at `http://localhost/api/docs`.

## Observability Stack

```bash
docker compose -f docker-compose.yml -f docker-compose.observability.yml up -d
```

- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001`
- Loki: `http://localhost:3100`
- Alertmanager: `http://localhost:9093`

Prometheus scrapes `/system/metrics`. Grafana provisions the Sentra Enterprise Operations dashboard automatically.

## Health Checks

```bash
curl http://localhost/api/health
curl http://localhost/api/system/health/deep
curl http://localhost/api/system/observability
curl http://localhost/api/system/metrics
```

## Backups

PowerShell:

```powershell
scripts/backup.ps1
scripts/restore.ps1 -BackupPath backups/sentra-YYYYMMDD-HHMMSS.sql
```

Bash:

```bash
scripts/backup.sh
scripts/restore.sh backups/sentra-YYYYMMDD-HHMMSS.sql
```

Default backup retention is 14 days and can be changed with `SENTRA_BACKUP_RETENTION_DAYS`.

## Blue/Green Release

```bash
ENV_FILE=.env.staging scripts/deploy-blue-green.sh blue
ENV_FILE=.env.production scripts/deploy-blue-green.sh green
scripts/rollback.sh blue
```

New versions must pass smoke checks before traffic cutover. Keep the previous color alive until the new color is healthy.

## CI/CD

GitHub Actions workflows:

- `ci.yml`: frontend, backend, and Docker validation.
- `security.yml`: dependency and image vulnerability scans.
- `cd.yml`: image publishing, staging deploy, production gate, blue/green deploy.
- `release.yml`: semantic tag validation and changelog generation.

## Incident Response

Use the dashboard `Operations Control Center` for live platform status, alerts, backup state, cache health, queue depth, and rollback readiness.
