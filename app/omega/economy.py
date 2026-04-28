"""Economic shock intelligence."""

from __future__ import annotations

from app.omega.models import OmegaMetrics


def build_economy(metrics: OmegaMetrics) -> dict[str, object]:
    return {
        "global_growth_confidence": 81,
        "banking_shock_probability": 18,
        "inflation_wave_risk": 37,
        "market_confidence": 84,
        "trade_collapse_probability": 21,
        "economic_pressure": "moderate",
        "shock_paths": [
            {"shock": "oil price spike", "probability": 31, "impact": "$420B exposed GDP"},
            {"shock": "shipping rate surge", "probability": metrics.supply_chokepoints * 5, "impact": "18% route cost uplift"},
            {"shock": "regional credit tightening", "probability": 22, "impact": "slower infrastructure spend"},
        ],
    }

