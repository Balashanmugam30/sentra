from __future__ import annotations

from app.civilization_infra.models import CIVILIZATION_METRICS, COUNTRY_GRID


def national_grid() -> dict[str, object]:
    return {
        "countries_connected": CIVILIZATION_METRICS["countries_connected"],
        "ministries_active": 42,
        "emergency_mesh_health": 94,
        "readiness_score": 93,
        "countries": COUNTRY_GRID,
        "command_posture": "multi-ministry continuity mesh active",
    }


def continuity_backbone() -> dict[str, object]:
    return {
        "recovery_eta_minutes": 28,
        "redundancy_depth": 94,
        "cross_sector_coordination": CIVILIZATION_METRICS["recovery_coordination_score"],
        "population_served": CIVILIZATION_METRICS["population_supported"],
        "continuity_layers": [
            {"layer": "Government operations", "health": 94},
            {"layer": "Emergency communications", "health": 96},
            {"layer": "Power and water", "health": 91},
            {"layer": "Transport corridors", "health": 89},
            {"layer": "Healthcare surge", "health": 87},
        ],
    }

