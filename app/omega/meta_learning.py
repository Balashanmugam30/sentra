"""Meta-learning intelligence grid."""

from __future__ import annotations

from app.omega.models import OmegaMetrics


def build_meta_learning(metrics: OmegaMetrics) -> dict[str, object]:
    return {
        "accepted_decisions_percent": metrics.accepted_decisions_percent,
        "rejected_decisions_percent": metrics.rejected_decisions_percent,
        "override_rate_percent": metrics.override_rate_percent,
        "learning_sources": [
            {"source": "accepted actions", "weight": 34},
            {"source": "operator overrides", "weight": 21},
            {"source": "incident outcomes", "weight": 28},
            {"source": "failed predictions", "weight": 17},
        ],
        "confidence_change_reason": "confidence rose because similar historical interventions improved recovery and trust scores.",
    }

