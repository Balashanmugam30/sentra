"""Economic command grid model."""

from __future__ import annotations

from typing import Any

from .models import WorldMetrics


def build_economy(metrics: WorldMetrics) -> dict[str, Any]:
    return {
        "global_gdp_pressure": 42,
        "oil_energy_risk": 36,
        "shipping_pressure": 49,
        "inflation_wave_risk": 33,
        "market_confidence": 78,
        "supply_elasticity": 71,
        "recovery_confidence": 86,
        "economic_pressure": metrics.economic_pressure,
        "hotspots": [
            {"market": "UAE critical infrastructure", "arr_opportunity": 8_400_000, "risk": 19},
            {"market": "US healthcare resilience", "arr_opportunity": 12_700_000, "risk": 24},
            {"market": "India smart campus", "arr_opportunity": 6_900_000, "risk": 17},
        ],
    }

