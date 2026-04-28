from __future__ import annotations

from typing import Any


def build_defense_grid(metrics: dict[str, Any]) -> dict[str, Any]:
    return {
        "airspace_alerts": [
            {"zone": "North Air Corridor", "severity": "watch", "confidence": 82},
            {"zone": "Coastal Drone Shelf", "severity": "elevated", "confidence": 76},
        ],
        "naval_zone_alerts": [
            {"zone": "South Maritime Lane", "severity": "moderate", "confidence": 79},
            {"zone": "Port Anchorage Delta", "severity": "watch", "confidence": 84},
        ],
        "ground_movement": [
            {"sector": "Border Sector 4", "movement_score": 31, "trend": "stable"},
            {"sector": "Industrial Belt", "movement_score": 44, "trend": "rising"},
        ],
        "strategic_assets": [
            {"asset": "Command Relay Alpha", "status": "hardened", "readiness": 94},
            {"asset": "Radar Grid East", "status": "online", "readiness": 91},
            {"asset": "Logistics Reserve South", "status": "mobilizable", "readiness": 86},
        ],
        "radar_confidence": 88,
        "threat_ranking": ["drone intrusion", "maritime anomaly", "grid cyber probing", "mass evacuation congestion"],
        "defense_posture": "guarded",
    }
