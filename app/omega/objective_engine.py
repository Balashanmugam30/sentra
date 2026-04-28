"""Objective engine for human-governed superintelligence."""

from __future__ import annotations

from app.omega.models import OmegaMetrics


OBJECTIVES = [
    "maximize safety",
    "fastest recovery",
    "protect economy",
    "reduce casualties",
    "preserve trust",
    "minimize downtime",
    "maximize revenue",
]


def build_objectives(metrics: OmegaMetrics) -> dict[str, object]:
    return {
        "active_objective": metrics.current_objective,
        "available_objectives": OBJECTIVES,
        "recommended_objective": "maximize safety",
        "reason": "safety objective gives best blend of trust, continuity, and civilization resilience under current global conditions.",
    }

