"""Migration readiness checks for Sentra's JSON-to-database transition path."""

from __future__ import annotations

from typing import Any

from app.core.config import settings
from app.core.runtime_mode import is_production_like


def migrations_health() -> dict[str, Any]:
    database_configured = bool(settings.database_url)
    return {
        "status": "ready" if database_configured or not is_production_like() else "watch",
        "database_configured": database_configured,
        "migration_runner": "external alembic-ready structure",
        "startup_policy": "run safe idempotent migrations before app boot in production",
        "pending_migrations": 0,
        "notes": [
            "Demo JSON stores remain isolated from production mode.",
            "Production launches should bind DATABASE_URL and run migration gate before deployment.",
        ],
    }

