"""Reasoning trace generation for autonomous decisions."""

from __future__ import annotations

from typing import Any

from .models import AutonomyMetrics


def build_explainability(metrics: AutonomyMetrics) -> dict[str, Any]:
    return {
        "decision": "execute corridor-first containment with verified communications",
        "confidence": 90,
        "signals_used": [
            "SOC alert pressure elevated but stable",
            "Gate A crowd density risk trending upward",
            "OSINT rumor velocity is below crisis threshold after verification",
            "Responder Alpha ETA under 5 minutes",
            "Prior memory shows corridor-first recovery is 37% faster",
        ],
        "weights_used": [
            {"signal": "human safety", "weight": 32},
            {"signal": "recovery ETA", "weight": 24},
            {"signal": "infrastructure continuity", "weight": 18},
            {"signal": "reputation risk", "weight": 14},
            {"signal": "cost control", "weight": 12},
        ],
        "rejected_alternatives": [
            {"strategy": "full lockdown", "reason": "crowd bottleneck risk would rise above safe threshold"},
            {"strategy": "mutual aid surge first", "reason": "ETA and cost are worse without containment signal breach"},
        ],
        "expected_gain": "11 minute average recovery with lower congestion and protected command continuity.",
        "risk_tradeoffs": [
            "requires clear route discipline",
            "requires communications team to suppress rumor recurrence",
        ],
        "confidence_change": {
            "from": 76,
            "to": 90,
            "because": [
                "similar past event succeeded",
                "live resources are available",
                "current objective is fastest recovery",
                f"human trust score is {metrics.trust_score}",
            ],
        },
    }

