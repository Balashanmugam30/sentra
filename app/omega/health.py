"""Pandemic and public health watch engine."""

from __future__ import annotations

from app.omega.models import OmegaMetrics


def build_health(metrics: OmegaMetrics) -> dict[str, object]:
    return {
        "pandemic_watch_zones": metrics.pandemic_watch_zones,
        "outbreak_probability": 19,
        "hospital_load_index": 58,
        "spread_velocity": "contained-watch",
        "vaccine_readiness": 87,
        "watch_zones": [
            {"region": "Southeast Asia", "probability": 21, "hospital_load": 62},
            {"region": "West Africa", "probability": 18, "hospital_load": 54},
            {"region": "South America", "probability": 16, "hospital_load": 56},
        ],
    }

