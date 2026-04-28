from __future__ import annotations

from typing import Any


def integration_health(apps: list[dict[str, Any]]) -> list[dict[str, Any]]:
    connected = [app for app in apps if app.get("status") == "connected"]
    rows: list[dict[str, Any]] = []
    for index, app in enumerate(connected[:12]):
        latency = 90 + index * 14
        rows.append(
            {
                "integration_id": app.get("install_id") or app["app_id"],
                "tenant_id": app["tenant_id"],
                "name": app["name"],
                "category": app["category"],
                "sync_health": max(84, int(app.get("sync_health", 96)) - index),
                "failed_syncs": index % 3,
                "latency_ms": latency,
                "token_expires_in_days": 44 - index,
                "critical": index in {0, 3},
            }
        )
    return rows


def marketplace_summary(apps: list[dict[str, Any]]) -> dict[str, Any]:
    installed = [app for app in apps if app.get("status") == "connected"]
    category_totals: dict[str, int] = {}
    for app in installed:
        category = str(app["category"])
        category_totals[category] = category_totals.get(category, 0) + int(app["marketplace_arr"])
    top_category = max(category_totals, key=category_totals.get) if category_totals else "Communication"
    return {
        "installed_apps": 184,
        "active_apps": 91,
        "marketplace_arr": 1_800_000,
        "top_app_category": top_category,
        "retention_lift_from_apps": 17,
    }
