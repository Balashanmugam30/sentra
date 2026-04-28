"""Global supply chain war room engine."""

from __future__ import annotations

from typing import Any

from .models import WorldMetrics


def build_supply_chain(metrics: WorldMetrics) -> dict[str, Any]:
    return {
        "chokepoints": metrics.supply_chain_chokepoints,
        "ports": [
            {"name": "Singapore", "status": "strong", "risk": 18},
            {"name": "Jebel Ali", "status": "priority", "risk": 22},
            {"name": "Rotterdam", "status": "watch", "risk": 31},
        ],
        "air_cargo": {"capacity": 82, "risk": 24, "priority_lane": "UAE-India emergency cargo"},
        "sea_lanes": [
            {"lane": "Red Sea", "risk": 66, "recommendation": "reroute high-value cargo"},
            {"lane": "Malacca Strait", "risk": 29, "recommendation": "monitor but keep active"},
        ],
        "rail_choke_points": [
            {"corridor": "Europe east-west", "risk": 43},
            {"corridor": "India freight north-south", "risk": 28},
        ],
        "semiconductor_risk": 47,
        "medicine_shortage": 34,
        "food_logistics": 39,
    }

