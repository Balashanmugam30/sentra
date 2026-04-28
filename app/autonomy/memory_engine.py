"""Strategic memory synthesis for Autonomy OS."""

from __future__ import annotations

from typing import Any

from .models import AutonomyMetrics


def build_memory(metrics: AutonomyMetrics) -> dict[str, Any]:
    episodes = [
        {
            "episode_id": "MEM-FIRE-021",
            "scenario": "zone fire escalation",
            "decision": "corridor isolation before full evacuation",
            "outcome": "contained",
            "time_to_recovery_minutes": 9,
            "confidence_before": 74,
            "confidence_after": 87,
            "lesson": "Isolate smoke path first when responder density is high.",
            "accepted": True,
        },
        {
            "episode_id": "MEM-OSINT-014",
            "scenario": "fake lockdown rumor",
            "decision": "public correction plus campus comms blast",
            "outcome": "panic suppressed",
            "time_to_recovery_minutes": 13,
            "confidence_before": 66,
            "confidence_after": 84,
            "lesson": "Rapid verified messaging reduces rumor velocity faster than silent monitoring.",
            "accepted": True,
        },
        {
            "episode_id": "MEM-GRID-009",
            "scenario": "city power instability",
            "decision": "backup power staged before utility outage",
            "outcome": "continuity preserved",
            "time_to_recovery_minutes": 18,
            "confidence_before": 71,
            "confidence_after": 82,
            "lesson": "Pre-stage generators when grid confidence drops below 88.",
            "accepted": True,
        },
        {
            "episode_id": "MEM-CROWD-006",
            "scenario": "gate crowd pressure",
            "decision": "lockdown proposal rejected",
            "outcome": "replaced with routed release",
            "time_to_recovery_minutes": 16,
            "confidence_before": 59,
            "confidence_after": 77,
            "lesson": "Avoid lockdown when evacuation bottleneck score is above 70.",
            "accepted": False,
        },
    ]
    return {
        "episodes": episodes,
        "best_outcomes": [
            "corridor isolation reduced fire recovery by 37%",
            "verified public statement lowered rumor risk within 11 minutes",
            "backup power staging preserved executive operations",
        ],
        "worst_failures": [
            "full lockdown under crowd pressure increased congestion in prior drill",
            "late public update allowed rumor cascade to double in 8 minutes",
        ],
        "trusted_playbooks": [
            {"name": "Fastest Recovery Corridor Plan", "win_rate": 91, "uses": 12},
            {"name": "Verified Rumor Suppression", "win_rate": 88, "uses": 9},
            {"name": "Power Continuity Shield", "win_rate": 86, "uses": 7},
        ],
        "recent_learnings": [
            f"Current objective '{metrics.current_objective}' increased planning priority.",
            f"Prediction accuracy holding at {metrics.prediction_accuracy_percent}%.",
            f"{metrics.playbooks_learned} playbooks now have outcome-weighted scoring.",
        ],
    }

