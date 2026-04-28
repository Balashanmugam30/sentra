"""Goal/objective selection engine for Autonomy OS."""

from __future__ import annotations

from typing import Any

from .models import AutonomyMetrics


OBJECTIVES = [
    ("minimize casualties", "prioritize medical safety, evacuation integrity, and hazard separation", 93),
    ("fastest recovery", "restore operational stability with the shortest safe ETA", 96),
    ("preserve revenue", "protect business continuity and high-value operating zones", 83),
    ("protect reputation", "reduce public uncertainty and media escalation", 86),
    ("maintain continuity", "keep critical systems online during degraded operations", 91),
    ("reduce costs", "lower response cost without increasing risk exposure", 72),
    ("maximize readiness", "raise posture before incidents become active", 90),
    ("defend borders", "protect sovereign and perimeter integrity", 84),
    ("protect infrastructure", "prioritize power, telecom, transport, and facility resilience", 89),
]


def build_objectives(metrics: AutonomyMetrics) -> dict[str, Any]:
    objective_cards = []
    for objective, description, score in OBJECTIVES:
        is_current = objective == metrics.current_objective
        objective_cards.append(
            {
                "objective": objective,
                "description": description,
                "priority_score": min(100, score + (4 if is_current else 0)),
                "status": "active" if is_current else "available",
                "governance": metrics.autonomy_mode,
            }
        )
    active = next((item for item in objective_cards if item["status"] == "active"), objective_cards[1])
    return {
        "active_objective": active,
        "objectives": objective_cards,
        "alignment_score": 92,
        "objective_conflicts": [
            "fastest recovery may conflict with lowest-cost posture",
            "protect reputation requires earlier communications than tactical teams prefer",
        ],
    }

