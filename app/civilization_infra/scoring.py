from __future__ import annotations

from app.civilization_infra.models import CIVILIZATION_METRICS


def live_snapshot() -> dict[str, object]:
    return {
        **CIVILIZATION_METRICS,
        "backbone_thesis": "Sentra coordinates national, city, utility, healthcare, transport, education, food, water, and disaster systems into one continuity operating layer.",
    }


def civilization_score() -> dict[str, object]:
    return {
        "civilization_score": CIVILIZATION_METRICS["civilization_score"],
        "label": CIVILIZATION_METRICS["label"],
        "national_grid_score": 94,
        "mega_city_score": 92,
        "utility_resilience_score": 93,
        "transport_score": 91,
        "healthcare_score": 89,
        "education_score": 88,
        "food_security_score": 90,
        "water_command_score": CIVILIZATION_METRICS["water_security_score"],
        "disaster_prediction_score": CIVILIZATION_METRICS["disaster_forecast_accuracy"],
        "continuity_backbone_score": CIVILIZATION_METRICS["recovery_coordination_score"],
    }

