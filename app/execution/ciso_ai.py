from __future__ import annotations

from typing import Any


def build_ciso_ai(metrics: dict[str, Any]) -> dict[str, Any]:
    return {
        "org_risk_score": 23,
        "security_maturity": int(metrics["security_maturity"]),
        "policy_violations": 3,
        "compliance_posture": int(metrics["compliance_posture"]),
        "insider_risk": 14,
        "board_security_readiness": 91,
        "priority_controls": [
            "Finalize SOC2 control evidence.",
            "Require re-auth for finance and admin actions.",
            "Segment government demo environments.",
        ],
    }
