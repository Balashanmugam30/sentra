"""Autonomous planning and campaign generation."""

from __future__ import annotations

from typing import Any

from .models import AutonomyMetrics


def build_plan(metrics: AutonomyMetrics) -> dict[str, Any]:
    return {
        "objective": metrics.current_objective,
        "confidence": 90,
        "campaign_status": "active planning loop",
        "fifteen_minute_plan": [
            "Stabilize active incident telemetry and lock priority signals.",
            "Pre-position response units near highest-risk zones.",
            "Send verified internal advisory to reduce uncertainty.",
        ],
        "sixty_minute_campaign": [
            "Execute corridor-first containment plan.",
            "Keep backup power and comms channels in warm standby.",
            "Review AI recommendation outcomes with human commander every 10 minutes.",
        ],
        "twenty_four_hour_stabilization": [
            "Generate post-incident memory update and tune playbook weights.",
            "Run executive continuity review and publish board-safe summary.",
            "Refresh tenant readiness score from operational outcomes.",
        ],
        "resource_plan": [
            {"resource": "Responder Alpha", "assignment": "north corridor standby", "eta_minutes": 4},
            {"resource": "Medical Team B", "assignment": "Gate A triage reserve", "eta_minutes": 6},
            {"resource": "Backup Power Cell", "assignment": "command wing continuity", "eta_minutes": 8},
        ],
        "communications_plan": [
            {"audience": "occupants", "channel": "in_app + PA", "message": "Follow routed guidance and avoid Gate A."},
            {"audience": "executives", "channel": "briefing feed", "message": "Containment confidence remains above 80%."},
            {"audience": "public", "channel": "verified advisory", "message": "No confirmed campus-wide lockdown."},
        ],
        "board_plan": [
            "Preserve continuity posture.",
            "Approve emergency spend only if recovery ETA exceeds 20 minutes.",
            "Review trust and override metrics after stabilization.",
        ],
    }

