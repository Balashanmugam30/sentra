"""Human governance control layer."""

from __future__ import annotations

from app.omega.models import OmegaMetrics


def build_governance(metrics: OmegaMetrics, events: list[dict[str, object]]) -> dict[str, object]:
    return {
        "mode": metrics.governance_mode,
        "modes": ["advisory", "approval_required", "semi_autonomous", "full_autonomous", "emergency_manual_override"],
        "high_risk_requires_approval": True,
        "override_events": events[-8:],
        "guardrails": [
            "human approval required for autonomous mode escalation",
            "emergency manual override always available",
            "all actions audit signed",
            "explainability mandatory before execution",
        ],
    }

