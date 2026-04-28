# Sentra Deployment Guide

Sentra can run as a local-production parity stack with one command:

```powershell
docker compose up --build
```

The stack exposes:

- Frontend: http://localhost
- Backend API: http://localhost/api
- Swagger: http://localhost/api/docs

## Prerequisites

- Docker Desktop with Compose v2
- At least 6 GB available memory for the full dashboard build and runtime
- Ports `80`, `3000`, `8000`, `5432`, and `6379` available, or overridden in `.env`

## Docker Install

Install Docker Desktop from Docker's official site, start it, and verify:

```powershell
docker --version
docker compose version
```

## Environment Setup

Copy the template and edit secrets:

```powershell
Copy-Item .env.example .env
```

Replace these before shared or production use:

- `SECRET_KEY`
- `JWT_SECRET`
- `DB_PASSWORD`
- `ADMIN_PASSWORD`

For local demo mode, external API keys can remain empty. Sentra will use deterministic demo providers for weather, OSINT, traffic, and utilities.

## Run

```powershell
docker compose up --build
```

Windows helper:

```powershell
.\run.ps1 up
```

Open http://localhost after all services are healthy.

## Logs

```powershell
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx
```

Windows helper:

```powershell
.\run.ps1 logs
```

## Health Checks

```powershell
curl http://localhost
curl http://localhost/api/health
curl http://localhost/api/system/health/deep
curl http://localhost/api/system/observability
curl http://localhost/api/system/metrics
curl http://localhost/api/docs
docker compose ps
```

## Observability

Run the production monitoring stack alongside Sentra:

```powershell
docker compose -f docker-compose.yml -f docker-compose.observability.yml up -d
```

- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001
- Loki: http://localhost:3100
- Alertmanager: http://localhost:9093

Grafana auto-provisions the `Sentra Enterprise Operations` dashboard.

## Backups And Restore

```powershell
.\scripts\backup.ps1
.\scripts\restore.ps1 -BackupPath .\backups\sentra-YYYYMMDD-HHMMSS.sql
```

Bash equivalents are available at `scripts/backup.sh` and `scripts/restore.sh`.

## Reset Volumes

This clears PostgreSQL, Redis, and Sentra's containerized auth/audit JSON store.

```powershell
docker compose down -v
```

Windows helper:

```powershell
.\run.ps1 reset-volumes
```

## Common Fixes

- Port `80` is busy: set `HTTP_PORT=8080` in `.env`, then use http://localhost:8080.
- Frontend cannot call API: confirm `NEXT_PUBLIC_API_BASE=/api` and Nginx is healthy.
- Login session is lost after restart: confirm the `backend_data` volume exists and `JWT_SECRET` did not change.
- Swagger is missing: check `docker compose logs backend` and verify `GET /api/health`.
- Docker build is slow: rerun `docker compose build frontend` after dependency changes settle.

## Upgrade Steps

1. Pull or merge code changes.
2. Review `.env.example` for new variables and copy them into `.env`.
3. Run the smoke test:

```powershell
.\scripts\smoke-test.ps1
```

4. Rebuild:

```powershell
docker compose up --build
```

5. Verify:

```powershell
curl http://localhost/api/health
curl http://localhost/api/docs
```

## Production Notes

- Put TLS in front of Nginx or terminate TLS at your ingress/load balancer.
- Set `SENTRA_COOKIE_SECURE=true` when serving over HTTPS.
- Use unique, long `SECRET_KEY` and `JWT_SECRET` values.
- Replace demo provider settings with approved live keys only when authorized.
- Keep PostgreSQL and Redis on the internal Docker network unless your deployment model requires external managed services.
