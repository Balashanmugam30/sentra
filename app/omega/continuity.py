"""Future timeline and continuity forecasting."""

from __future__ import annotations

from app.omega.models import OmegaMetrics


def build_future_timeline(metrics: OmegaMetrics) -> dict[str, object]:
    return {
        "forecast_accuracy": metrics.forecast_accuracy,
        "horizons": [
            {"horizon": "24h", "risk": "cyber probes and weather pressure", "confidence": 96, "best_action": "keep critical infra shield active"},
            {"horizon": "7d", "risk": "trade corridor volatility", "confidence": 94, "best_action": "pre-stage logistics routes"},
            {"horizon": "30d", "risk": "heat and water stress", "confidence": 91, "best_action": "activate municipal resilience plans"},
            {"horizon": "1y", "risk": "regional energy stress", "confidence": 87, "best_action": "increase reserve diversity"},
            {"horizon": "10y", "risk": "climate migration pressure", "confidence": 78, "best_action": "build adaptive city capacity"},
        ],
    }


def build_continuity(metrics: OmegaMetrics) -> dict[str, object]:
    return {
        "civilization_resilience": metrics.civilization_resilience,
        "continuity_status": "dominant-stable",
        "recovery_eta_minutes": 18,
        "global_recovery_confidence": 92,
        "timeline": build_future_timeline(metrics),
    }

