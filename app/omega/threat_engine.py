"""Global threat fusion engine."""

from __future__ import annotations

from app.omega.cyber import build_cyber
from app.omega.geopolitics import build_geopolitics
from app.omega.models import OmegaMetrics


def build_threats(metrics: OmegaMetrics) -> dict[str, object]:
    geopolitics = build_geopolitics(metrics)
    cyber = build_cyber(metrics)
    threats = [
        {"threat": "war escalation", "severity": 72, "probability": geopolitics["war_probability_index"], "response": "diplomatic de-escalation corridor"},
        {"threat": "cyberattack wave", "severity": 69, "probability": cyber["cyber_attack_probability"], "response": "critical infra hardening"},
        {"threat": "trade corridor collapse", "severity": 66, "probability": 24, "response": "reroute logistics and fuel buffers"},
        {"threat": "civil unrest", "severity": 58, "probability": geopolitics["civil_unrest_index"], "response": "food, comms, and public trust stabilization"},
        {"threat": "satellite disruption", "severity": 55, "probability": 22, "response": "backup terrestrial routing"},
    ]
    return {
        "threat_events": metrics.threat_events,
        "top_threat": threats[0],
        "threats": threats,
        "geopolitics": geopolitics,
        "cyber": cyber,
    }

