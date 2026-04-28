"""Recursive self-improvement engine."""

from __future__ import annotations

from app.omega.models import OmegaMetrics


def build_self_improvement(metrics: OmegaMetrics) -> dict[str, object]:
    return {
        "decision_accuracy": metrics.decision_accuracy,
        "learning_gain_percent": metrics.learning_gain_percent,
        "improvement_cycles": metrics.improvement_cycles,
        "improved_domains": [
            {"domain": "forecasting weights", "gain": 22},
            {"domain": "resource allocation", "gain": 31},
            {"domain": "anomaly thresholds", "gain": 18},
            {"domain": "UI prioritization", "gain": 14},
            {"domain": "routing logic", "gain": 16},
        ],
    }


def run_improvement(metrics: OmegaMetrics) -> dict[str, object]:
    metrics.improvement_cycles += 1
    metrics.learning_gain_percent = min(35, metrics.learning_gain_percent + 1)
    metrics.decision_accuracy = min(98, metrics.decision_accuracy + 1)
    return {
        "cycle": metrics.improvement_cycles,
        "decision_accuracy": metrics.decision_accuracy,
        "learning_gain_percent": metrics.learning_gain_percent,
        "changes": ["tightened logistics risk weights", "prioritized trust-preserving actions", "reduced recovery ETA forecast drift"],
    }

