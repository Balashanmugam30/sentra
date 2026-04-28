from __future__ import annotations

from app.civilization_infra.models import CIVILIZATION_METRICS


def transport_command() -> dict[str, object]:
    return {
        "transport_nodes": CIVILIZATION_METRICS["transport_nodes"],
        "airports": 86,
        "ports": 42,
        "rail_nodes": 620,
        "metro_nodes": 710,
        "freight_nodes": 382,
        "reroute_efficiency": 91,
        "corridors": [
            {"name": "Air Cargo Spine", "mode": "air", "flow": 88, "reroute": 93},
            {"name": "Coastal Port Chain", "mode": "sea", "flow": 84, "reroute": 89},
            {"name": "National Rail Mesh", "mode": "rail", "flow": 91, "reroute": 92},
            {"name": "Metro Evac Loop", "mode": "metro", "flow": 86, "reroute": 88},
        ],
    }

