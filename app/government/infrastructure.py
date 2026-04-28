from __future__ import annotations

from typing import Any

from app.government.models import INFRASTRUCTURE_ASSETS


def build_infrastructure(metrics: dict[str, Any]) -> dict[str, Any]:
    assets = list(INFRASTRUCTURE_ASSETS)
    avg_uptime = round(sum(float(item["uptime"]) for item in assets) / len(assets), 1)
    avg_risk = round(sum(int(item["risk"]) for item in assets) / len(assets))
    return {
        "assets": assets,
        "average_uptime": avg_uptime,
        "average_risk": avg_risk,
        "airports_protected": int(metrics["airports_protected"]),
        "ports_protected": int(metrics["ports_protected"]),
        "grid_stability": int(metrics["grid_stability"]),
        "priority_repairs": ["Regional Medical Surge Network", "National Rail Operations Spine", "South Maritime Port"],
    }
