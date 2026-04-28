from __future__ import annotations

from app.civilization_infra.models import CIVILIZATION_METRICS, MEGA_CITIES


def mega_city_ops() -> dict[str, object]:
    return {
        "cities_onboarded": CIVILIZATION_METRICS["cities_active"],
        "traffic_intelligence": 92,
        "crowd_flow": 89,
        "emergency_corridors": 284,
        "public_safety_posture": 91,
        "cities": MEGA_CITIES,
    }


def education_grid() -> dict[str, object]:
    return {
        "universities": CIVILIZATION_METRICS["universities"],
        "schools": 18_400,
        "campus_safety": 92,
        "continuity_learning_posture": 88,
        "remote_continuity_capacity": 84,
        "priority_networks": ["Bala University", "Metro Campus Group", "SmartCare Training Grid", "GovSecure Education South"],
    }

