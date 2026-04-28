"""Autonomous strategy engine."""

from __future__ import annotations

from app.omega.models import OmegaMetrics


def build_strategy(metrics: OmegaMetrics) -> dict[str, object]:
    return {
        "strategic_posture": "protect safety while preserving economic continuity",
        "top_strategy": "stabilize supply, energy, water, and public trust before kinetic escalation.",
        "alternatives_rejected": [
            {"option": "full lockdown posture", "reason": "too much economic and migration pressure"},
            {"option": "market-first response", "reason": "lower safety confidence under compound shock"},
        ],
        "strategy_score": 96,
    }

