"""Geopolitical risk intelligence."""

from __future__ import annotations

from app.omega.models import OmegaMetrics


def build_geopolitics(metrics: OmegaMetrics) -> dict[str, object]:
    return {
        "war_probability_index": 32,
        "war_risk_regions": metrics.war_risk_regions,
        "sanctions_pressure": 44,
        "civil_unrest_index": 38,
        "diplomatic_stability": 84,
        "risk_regions": [
            {"region": "Eastern Europe", "war_probability": 41, "stabilizer": "energy corridor diplomacy"},
            {"region": "Red Sea", "war_probability": 34, "stabilizer": "naval logistics coordination"},
            {"region": "South China Sea", "war_probability": 29, "stabilizer": "trade confidence backchannel"},
            {"region": "Sahel Belt", "war_probability": 27, "stabilizer": "food and migration support"},
        ],
    }

