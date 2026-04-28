from __future__ import annotations

from typing import Any

from app.government.models import AGENCIES


def build_multi_agency(metrics: dict[str, Any]) -> dict[str, Any]:
    return {
        "agencies": list(AGENCIES),
        "active_agencies": int(metrics["active_agencies"]),
        "states_connected": int(metrics["states_connected"]),
        "communication_mesh_health": 89,
        "coordination_risk": 22,
        "top_coordination_need": "Synchronize health, transport, and telecom for coastal cyclone response.",
    }
