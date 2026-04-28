"""Liveness/readiness helpers for production launch probes."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.core.observability import build_deep_health
from app.core.production import launch_readiness_score
from app.core.startup_checks import run_startup_checks


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def liveness_payload() -> dict[str, Any]:
    return {"status": "alive", "generated_at": _now(), "service": "sentra-backend"}


def readiness_payload() -> dict[str, Any]:
    startup = run_startup_checks()
    deep = build_deep_health()
    readiness = launch_readiness_score()
    status = "ready"
    if startup["status"] == "blocked" or deep["status"] == "degraded":
        status = "not_ready"
    elif deep["status"] == "watch" or readiness["score"] < 80:
        status = "watch"
    return {
        "status": status,
        "generated_at": _now(),
        "startup": startup,
        "health": deep,
        "launch_readiness": readiness,
    }


def health_payload() -> dict[str, Any]:
    return {"status": "ok", "generated_at": _now(), "readiness": readiness_payload()["status"]}

