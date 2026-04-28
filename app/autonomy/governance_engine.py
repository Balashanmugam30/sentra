"""Governance and human override policy engine."""

from __future__ import annotations

from typing import Any

from .models import AutonomyMetrics, GovernanceOverride


MODES = [
    {
        "mode": "advisory",
        "label": "Advisory",
        "description": "AI recommends only; humans execute all decisions.",
        "risk_tolerance": "lowest",
    },
    {
        "mode": "approval_required",
        "label": "Approval Required",
        "description": "AI prepares actions but waits for commander approval.",
        "risk_tolerance": "low",
    },
    {
        "mode": "semi_auto",
        "label": "Semi Auto",
        "description": "Low-risk actions execute automatically; critical actions request approval.",
        "risk_tolerance": "controlled",
    },
    {
        "mode": "full_auto",
        "label": "Full Auto",
        "description": "AI executes within approved guardrails and logs all actions.",
        "risk_tolerance": "high with audit",
    },
    {
        "mode": "lockdown_mode",
        "label": "Lockdown Mode",
        "description": "Emergency posture with maximum safety controls and strict audit.",
        "risk_tolerance": "emergency",
    },
]


def build_governance(metrics: AutonomyMetrics, overrides: list[GovernanceOverride]) -> dict[str, Any]:
    return {
        "current_mode": metrics.autonomy_mode,
        "modes": MODES,
        "override_required_above_risk": 70 if metrics.autonomy_mode != "full_auto" else 88,
        "approval_chain": ["operations_commander", "executive", "super_admin"],
        "override_ledger": [override.as_dict() for override in overrides[-8:]],
        "policy_notes": [
            "client-sent tenant IDs are ignored; tenant context comes from auth/session",
            "high-risk actions remain human governed unless lockdown mode is explicitly enabled",
        ],
    }

