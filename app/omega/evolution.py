"""Strategy evolution and compound intelligence."""

from __future__ import annotations

from app.omega.models import OmegaMetrics


def build_evolution(metrics: OmegaMetrics) -> dict[str, object]:
    return {
        "compound_intelligence_score": metrics.compound_intelligence_score,
        "learning_gain_percent": metrics.learning_gain_percent,
        "recovery_improvement_percent": metrics.recovery_improvement_percent,
        "evolution_timeline": [
            {"stage": "Observe", "gain": 12, "summary": "more signal sources fused into one operational graph"},
            {"stage": "Predict", "gain": 22, "summary": "forecast weights improved after accepted outcomes"},
            {"stage": "Optimize", "gain": 31, "summary": "recovery ETA compressed by recursive planning"},
            {"stage": "Govern", "gain": 19, "summary": "trust controls preserved human authority"},
        ],
    }

