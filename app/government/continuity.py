from __future__ import annotations

from typing import Any


def build_continuity(metrics: dict[str, Any]) -> dict[str, Any]:
    return {
        "government_continuity_readiness": int(metrics["continuity_readiness"]),
        "alternate_HQ_status": "warm standby",
        "backup_network_readiness": 92,
        "emergency_communication_score": int(metrics["communications_continuity"]),
        "leadership_mobility_readiness": 86,
        "continuity_actions": [
            "Refresh alternate HQ activation roster.",
            "Increase satellite phone battery reserve.",
            "Run cabinet mobility drill within 14 days.",
        ],
        "strategic_continuity_class": "resilient",
    }
