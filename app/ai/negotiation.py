from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.ai.strategic_learning import build_debate_v2


def _now() -> datetime:
    return datetime.now(timezone.utc)


def build_negotiation_snapshot() -> dict[str, Any]:
    debate = build_debate_v2()
    demands = [
        {
            "agent": "Security AI",
            "demand": "Lock high-risk gates and preserve access integrity.",
            "concession": "Accept selective lockdown if medical corridor remains protected.",
            "priority": 88,
        },
        {
            "agent": "Medical AI",
            "demand": "Keep evacuation and triage corridors open.",
            "concession": "Allow corridor sealing only after protected flow is verified.",
            "priority": 94,
        },
        {
            "agent": "Executive AI",
            "demand": "Maintain continuity and minimize financial exposure.",
            "concession": "Accept short downtime if containment probability improves.",
            "priority": 76,
        },
        {
            "agent": "Comms AI",
            "demand": "Send calm verified messaging before public speculation rises.",
            "concession": "Delay broad public statement until sensor facts are confirmed.",
            "priority": 82,
        },
    ]
    return {
        "generated_at": _now(),
        "demands": demands,
        "conflicts": debate["conflicts"],
        "winning_compromise": debate["final_merged_plan"],
        "rejected_alternatives": [
            "Full lockdown rejected because it increases medical and evacuation friction.",
            "Passive monitoring rejected because cascade risk exceeds advisory threshold.",
            "Public silence rejected because rumor velocity can compound crowd pressure.",
        ],
        "negotiation_score": debate["consensus_percent"],
        "summary": f"AI negotiation reached {debate['consensus_percent']}% consensus with {len(debate['minority_concerns'])} minority concerns.",
    }
