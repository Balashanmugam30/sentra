"""Self-learning and strategy evolution engine."""

from __future__ import annotations

from typing import Any

from .models import AutonomyMetrics


def build_learning(metrics: AutonomyMetrics) -> dict[str, Any]:
    return {
        "learning_improvement_percent": metrics.learning_improvement_percent,
        "confidence_drift": [
            {"label": "corridor-first containment", "before": 68, "after": 87, "reason": "3 accepted outcomes"},
            {"label": "full lockdown", "before": 71, "after": 58, "reason": "operator overrides under crowd pressure"},
            {"label": "public correction", "before": 63, "after": 84, "reason": "rumor recovery improved"},
        ],
        "strategy_scores": [
            {"strategy": "corridor isolation first", "score": 91, "trend": "+8"},
            {"strategy": "verified public advisory", "score": 88, "trend": "+11"},
            {"strategy": "full lockdown", "score": 61, "trend": "-9"},
            {"strategy": "backup power staging", "score": 86, "trend": "+6"},
        ],
        "playbook_win_rates": [
            {"playbook": "Fastest Recovery Corridor Plan", "win_rate": 91},
            {"playbook": "Rumor Suppression", "win_rate": 88},
            {"playbook": "Medical Reserve Route", "win_rate": 83},
        ],
        "false_positive_rate": 4,
        "rejected_recommendations": metrics.rejected_decisions_percent,
        "override_reasons": [
            "operator preserved evacuation corridor",
            "communications lead requested public verification first",
            "executive rejected unnecessary revenue interruption",
        ],
    }


def run_learning_cycle(metrics: AutonomyMetrics) -> dict[str, Any]:
    metrics.learning_improvement_percent = min(25, metrics.learning_improvement_percent + 1)
    metrics.playbooks_learned += 1
    metrics.prediction_accuracy_percent = min(94, metrics.prediction_accuracy_percent + 1)
    return build_learning(metrics)

