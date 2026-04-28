"""Trust and confidence engine."""

from __future__ import annotations

from app.omega.models import OmegaMetrics


def build_trust(metrics: OmegaMetrics) -> dict[str, object]:
    return {
        "trust_score": metrics.trust_score,
        "accepted_decisions_percent": metrics.accepted_decisions_percent,
        "rejected_decisions_percent": metrics.rejected_decisions_percent,
        "override_rate_percent": metrics.override_rate_percent,
        "human_confidence": 92,
        "board_confidence": 90,
        "department_trust": [
            {"department": "operations", "score": 93, "trend": "+4"},
            {"department": "security", "score": 91, "trend": "+3"},
            {"department": "executive", "score": 90, "trend": "+5"},
            {"department": "public sector", "score": 89, "trend": "+2"},
        ],
    }

