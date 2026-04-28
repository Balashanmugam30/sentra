"""Planetary earth twin builders."""

from __future__ import annotations

from app.omega.models import OmegaMetrics


def build_earth_twin(metrics: OmegaMetrics) -> dict[str, object]:
    return {
        "countries_modeled": metrics.countries_modeled,
        "cities_active": metrics.cities_active,
        "regional_stress_zones": [
            {"region": "Eastern Europe", "stress": 74, "drivers": ["war escalation", "energy risk"]},
            {"region": "South Asia", "stress": 68, "drivers": ["heat", "water pressure", "migration"]},
            {"region": "Middle East", "stress": 71, "drivers": ["energy routes", "diplomatic tension"]},
            {"region": "Pacific Rim", "stress": 63, "drivers": ["trade disruption", "satellite congestion"]},
        ],
        "crisis_hotspots": [
            {"name": "Black Sea trade corridor", "severity": 82},
            {"name": "Gulf energy route", "severity": 77},
            {"name": "Bay of Bengal cyclone watch", "severity": 69},
        ],
        "operational_state": "planetary watch stable with elevated regional volatility",
    }


def build_planetary(metrics: OmegaMetrics) -> dict[str, object]:
    return {
        "earth_twin": build_earth_twin(metrics),
        "global_stability": metrics.global_stability,
        "civilization_resilience": metrics.civilization_resilience,
        "model_confidence": metrics.forecast_accuracy,
        "command_posture": "global superintelligence watch",
    }

