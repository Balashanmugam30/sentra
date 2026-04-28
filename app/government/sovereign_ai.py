from __future__ import annotations

from typing import Any


def build_sovereign_copilot(metrics: dict[str, Any]) -> dict[str, Any]:
    return {
        "posture": "sovereign command ready",
        "confidence": int(metrics["recovery_confidence"]),
        "recommendations": [
            "Deploy reserves to South region before cyclone landfall.",
            "Activate military logistics for coastal shelter supply.",
            "Lock vulnerable border sectors during emergency redeployment.",
            "Open emergency hospitals along rail and university shelter corridors.",
            "Shift telecom traffic to backup nodes and satellite relay.",
        ],
        "executive_summary": "National readiness is strong, but medical surge and rail redundancy need immediate reinforcement before compound disaster pressure.",
        "next_order": "Run cyclone plus grid instability war game and pre-stage multi-agency units.",
    }
