"""Startup dependency and configuration checks."""

from __future__ import annotations

import socket
import time
from typing import Any
from urllib.parse import urlparse

from app.core.config import settings
from app.core.production import validate_environment


def tcp_dependency_check(url: str, default_port: int, timeout_seconds: float = 0.75) -> dict[str, Any]:
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
            return {
                "configured": True,
                "status": "healthy",
                "host": host,
                "port": port,
                "latency_ms": round((time.perf_counter() - started) * 1000),
            }
    except OSError as error:
        return {
            "configured": True,
            "status": "unreachable",
            "host": host,
            "port": port,
            "latency_ms": round((time.perf_counter() - started) * 1000),
            "error": str(error),
        }


def run_startup_checks() -> dict[str, Any]:
    env_checks = validate_environment()
    dependencies = {
        "postgres": tcp_dependency_check(settings.database_url, 5432),
        "redis": tcp_dependency_check(settings.redis_url, 6379),
    }
    blocking_failures = [
        check.as_dict()
        for check in env_checks
        if check.status == "fail" and check.name in {"jwt_secret", "runtime_mode"}
    ]
    return {
        "status": "blocked" if blocking_failures else "ready",
        "environment": settings.app_env,
        "checks": [check.as_dict() for check in env_checks],
        "dependencies": dependencies,
        "blocking_failures": blocking_failures,
    }

