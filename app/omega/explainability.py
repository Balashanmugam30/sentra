"""Explainability engine for Omega recommendations."""

from __future__ import annotations

from app.omega.models import OmegaMetrics


def build_explainability(metrics: OmegaMetrics) -> dict[str, object]:
    return {
        "decision": "pre-stage logistics, energy reserves, and trust communications before regional escalation.",
        "why_action_chosen": "This action maximizes safety while preserving economic continuity and has the best memory-backed recovery profile.",
        "signals_used": [
            "war risk regions above baseline",
            "six supply chokepoints active",
            "energy stress in eight zones",
            "trust score remains high enough for public advisory leverage",
        ],
        "alternatives_rejected": [
            {"alternative": "full autonomous lockdown", "reason": "governance mode requires approval and economic damage would be high"},
            {"alternative": "wait for confirmed escalation", "reason": "forecast confidence supports earlier low-regret preparation"},
        ],
        "confidence": metrics.decision_accuracy,
        "confidence_change": "+4 because memory, forecast, and trust signals converged.",
    }

