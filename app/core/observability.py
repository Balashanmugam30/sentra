from __future__ import annotations

import json
import logging
import os
import socket
import time
from datetime import datetime, timezone
from logging.handlers import RotatingFileHandler
from pathlib import Path
from shutil import disk_usage
from typing import Any
from urllib.parse import urlparse

from app.core.config import settings
from app.core.runtime_cache import get_runtime_cache_stats
from app.services.connection_manager import incident_connection_manager
from app.soc.telemetry import TelemetryRecord, get_recent_telemetry, get_requests_last_minute

LOGGER_NAME = "sentra"


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": utc_now_iso(),
            "level": record.levelname.lower(),
            "service": "sentra-backend",
            "host": socket.gethostname(),
            "version": settings.app_version,
            "message": record.getMessage(),
        }
        extra_payload = getattr(record, "sentra", None)
        if isinstance(extra_payload, dict):
            payload.update({key: value for key, value in extra_payload.items() if value is not None})
        if record.exc_info:
            payload["error"] = self.formatException(record.exc_info)
        return json.dumps(payload, default=str, separators=(",", ":"))


def configure_structured_logging() -> logging.Logger:
    logger = logging.getLogger(LOGGER_NAME)
    if getattr(logger, "_sentra_configured", False):
        return logger

    logger.setLevel(settings.log_level.upper())
    logger.propagate = False
    formatter = JsonFormatter()

    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    log_path = Path(settings.log_file_path)
    log_path.parent.mkdir(parents=True, exist_ok=True)
    file_handler = RotatingFileHandler(
        log_path,
        maxBytes=settings.log_rotation_bytes,
        backupCount=settings.log_rotation_backups,
        encoding="utf-8",
    )
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    setattr(logger, "_sentra_configured", True)
    return logger


logger = configure_structured_logging()


def log_event(level: str, message: str, **fields: Any) -> None:
    log_level = getattr(logging, level.upper(), logging.INFO)
    logger.log(log_level, message, extra={"sentra": fields})


def _tcp_check(url: str, default_port: int, timeout_seconds: float = 1.0) -> dict[str, Any]:
    if not url:
        return {"configured": False, "status": "not_configured", "latency_ms": 0}

    parsed = urlparse(url)
    host = parsed.hostname
    port = parsed.port or default_port
    if not host:
        return {"configured": True, "status": "invalid_url", "latency_ms": 0}

    started = time.perf_counter()
    try:
        with socket.create_connection((host, port), timeout=timeout_seconds):
            latency_ms = round((time.perf_counter() - started) * 1000)
            return {"configured": True, "status": "healthy", "latency_ms": latency_ms, "host": host, "port": port}
    except OSError as error:
        latency_ms = round((time.perf_counter() - started) * 1000)
        return {
            "configured": True,
            "status": "unreachable",
            "latency_ms": latency_ms,
            "host": host,
            "port": port,
            "error": str(error),
        }


def _route_latency_quantiles(records: list[TelemetryRecord]) -> dict[str, int]:
    latencies = sorted(record.duration_ms for record in records)
    if not latencies:
        return {"p50": 0, "p95": 0, "p99": 0}

    def pick(percent: float) -> int:
        index = min(len(latencies) - 1, max(0, round((len(latencies) - 1) * percent)))
        return latencies[index]

    return {"p50": pick(0.5), "p95": pick(0.95), "p99": pick(0.99)}


def build_deep_health() -> dict[str, Any]:
    records = get_recent_telemetry()
    cache_stats = get_runtime_cache_stats()
    disk = disk_usage(os.getcwd())
    errors = sum(1 for record in records if record.status_code >= 500)
    quantiles = _route_latency_quantiles(records)
    postgres = _tcp_check(settings.database_url, 5432)
    redis = _tcp_check(settings.redis_url, 6379)
    status = "healthy"
    if postgres["status"] == "unreachable" or redis["status"] == "unreachable":
        status = "degraded"
    if errors >= settings.alert_error_rate_threshold:
        status = "watch"
    if quantiles["p95"] >= settings.alert_p95_latency_ms:
        status = "watch"

    return {
        "generated_at": utc_now_iso(),
        "status": status,
        "environment": settings.app_env,
        "version": settings.app_version,
        "checks": {
            "api": {"status": "healthy"},
            "postgres": postgres,
            "redis": redis,
            "websocket": {
                "status": "healthy",
                "clients": len(incident_connection_manager.active_connections),
            },
            "cache": {
                "status": "healthy",
                "entries": cache_stats["entries"],
                "hit_ratio": _cache_hit_ratio(cache_stats),
            },
            "disk": {
                "status": "watch" if disk.free / max(1, disk.total) < 0.2 else "healthy",
                "free_percent": round((disk.free / max(1, disk.total)) * 100, 2),
            },
        },
        "latency": quantiles,
        "requests_last_min": get_requests_last_minute(records),
        "errors_last_window": errors,
    }


def _cache_hit_ratio(cache_stats: dict[str, int]) -> int:
    total = cache_stats.get("hits", 0) + cache_stats.get("misses", 0)
    if total == 0:
        return 0
    return round((cache_stats.get("hits", 0) / total) * 100)


def compute_operational_alerts() -> list[dict[str, Any]]:
    records = get_recent_telemetry()
    cache_stats = get_runtime_cache_stats()
    health = build_deep_health()
    quantiles = _route_latency_quantiles(records)
    errors = sum(1 for record in records if record.status_code >= 500)
    auth_failures = sum(1 for record in records if record.path.startswith("/auth") and record.status_code >= 400)
    alerts: list[dict[str, Any]] = []

    def add(severity: str, title: str, description: str, action: str) -> None:
        alerts.append(
            {
                "alert_id": f"OPS-{len(alerts) + 1:03d}",
                "severity": severity,
                "title": title,
                "description": description,
                "recommended_action": action,
                "created_at": utc_now_iso(),
            }
        )

    if health["checks"]["postgres"]["status"] == "unreachable":
        add("critical", "Postgres unreachable", "Database TCP health check failed.", "Fail over or restore DB service.")
    if health["checks"]["redis"]["status"] == "unreachable":
        add("critical", "Redis unreachable", "Redis TCP health check failed.", "Fail over cache/session node.")
    if errors >= settings.alert_error_rate_threshold:
        add("critical", "API error spike", f"{errors} server errors detected.", "Review slowest/erroring routes.")
    if quantiles["p95"] >= settings.alert_p95_latency_ms:
        add(
            "critical",
            "P95 latency breach",
            f"P95 latency is {quantiles['p95']}ms.",
            "Scale backend or inspect hot routes.",
        )
    if auth_failures >= settings.alert_auth_failure_threshold:
        add(
            "critical",
            "Authentication failures spike",
            f"{auth_failures} auth failures detected.",
            "Review audit ledger and lockouts.",
        )
    if _cache_hit_ratio(cache_stats) < settings.alert_cache_hit_ratio_min and cache_stats.get("misses", 0) >= 10:
        add(
            "warning",
            "Cache hit ratio low",
            "Runtime cache is missing more often than expected.",
            "Tune TTLs for hot GET routes.",
        )
    disk = health["checks"]["disk"]
    if float(disk["free_percent"]) <= 20:
        add("warning", "Disk capacity below 20%", "Host disk free capacity is low.", "Prune logs or expand volume.")

    if not alerts:
        add(
            "low",
            "No active platform alerts",
            "All core SRE guardrails are currently within threshold.",
            "Continue monitoring.",
        )
    return alerts


def build_observability_snapshot() -> dict[str, Any]:
    records = get_recent_telemetry()
    cache_stats = get_runtime_cache_stats()
    health = build_deep_health()
    alerts = compute_operational_alerts()
    return {
        "generated_at": utc_now_iso(),
        "deployment": {
            "version": settings.app_version,
            "environment": settings.app_env,
            "release_channel": settings.release_channel,
            "commit_sha": settings.release_commit_sha,
        },
        "uptime_seconds": round(time.perf_counter()),
        "active_nodes": 1,
        "health": health,
        "alerts": alerts,
        "backup": {
            "status": "configured",
            "retention_days": settings.backup_retention_days,
            "last_successful_backup": settings.last_backup_at or "not_recorded",
        },
        "database": {
            "status": health["checks"]["postgres"]["status"],
            "size_mb": settings.database_size_estimate_mb,
            "pooling": "external_or_driver_pool_ready",
        },
        "cache": {
            "status": health["checks"]["redis"]["status"],
            "entries": cache_stats["entries"],
            "hit_ratio": _cache_hit_ratio(cache_stats),
            "singleflight_waits": cache_stats.get("singleflight_waits", 0),
        },
        "queue": {
            "depth": 0,
            "status": "idle",
        },
        "metrics": {
            "requests_last_min": get_requests_last_minute(records),
            "websocket_clients": len(incident_connection_manager.active_connections),
            "latency": health["latency"],
            "errors_last_window": health["errors_last_window"],
        },
        "release": {
            "strategy": "blue_green",
            "rollback_ready": True,
            "smoke_test_command": "scripts/smoke-test.ps1",
        },
    }


def build_prometheus_metrics() -> str:
    records = get_recent_telemetry()
    cache_stats = get_runtime_cache_stats()
    quantiles = _route_latency_quantiles(records)
    errors = sum(1 for record in records if record.status_code >= 500)
    lines = [
        "# HELP sentra_requests_last_minute Requests observed in the last minute.",
        "# TYPE sentra_requests_last_minute gauge",
        f"sentra_requests_last_minute {get_requests_last_minute(records)}",
        "# HELP sentra_request_latency_ms Request latency quantiles.",
        "# TYPE sentra_request_latency_ms gauge",
        f'sentra_request_latency_ms{{quantile="0.50"}} {quantiles["p50"]}',
        f'sentra_request_latency_ms{{quantile="0.95"}} {quantiles["p95"]}',
        f'sentra_request_latency_ms{{quantile="0.99"}} {quantiles["p99"]}',
        "# HELP sentra_errors_total Server-side errors in telemetry window.",
        "# TYPE sentra_errors_total gauge",
        f"sentra_errors_total {errors}",
        "# HELP sentra_websocket_clients Active websocket clients.",
        "# TYPE sentra_websocket_clients gauge",
        f"sentra_websocket_clients {len(incident_connection_manager.active_connections)}",
        "# HELP sentra_runtime_cache_entries Runtime cache entries.",
        "# TYPE sentra_runtime_cache_entries gauge",
        f"sentra_runtime_cache_entries {cache_stats['entries']}",
        "# HELP sentra_runtime_cache_hit_ratio Runtime cache hit ratio percent.",
        "# TYPE sentra_runtime_cache_hit_ratio gauge",
        f"sentra_runtime_cache_hit_ratio {_cache_hit_ratio(cache_stats)}",
    ]
    return "\n".join(lines) + "\n"
