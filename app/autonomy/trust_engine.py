"""Human trust and confidence scoring for Autonomy OS."""

from __future__ import annotations

from typing import Any

from .models import AutonomyMetrics


def build_trust(metrics: AutonomyMetrics) -> dict[str, Any]:
    return {
        "trust_score": metrics.trust_score,
        "accepted_percent": metrics.accepted_decisions_percent,
        "rejected_percent": metrics.rejected_decisions_percent,
        "manual_override_percent": metrics.override_rate_percent,
        "human_confidence": metrics.human_confidence,
        "board_confidence": metrics.board_confidence,
        "department_trust": [
            {"department": "Operations", "score": 92, "trend": "+5"},
            {"department": "Security", "score": 89, "trend": "+3"},
            {"department": "Communications", "score": 84, "trend": "+7"},
            {"department": "Executive", "score": 86, "trend": "+4"},
        ],
        "trust_drivers": [
            "explanations reference live signals and prior outcomes",
            "override governance remains active in high-risk modes",
            "prediction accuracy improved after latest learning cycle",
        ],
    }

