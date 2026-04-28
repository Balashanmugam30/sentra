from __future__ import annotations

from typing import Literal


IncidentMode = Literal[
    "monitor",
    "response",
    "evacuation",
    "lockdown",
    "mass-casualty",
]


def classify_incident_mode(
    severity_index: int,
    blocked_zone_count: int,
    restricted_zone_count: int,
    impacted_zone_count: int,
    global_load: str,
) -> IncidentMode:
    if global_load == "overloaded" and impacted_zone_count >= 4:
        return "mass-casualty"

    if restricted_zone_count >= 5:
        return "lockdown"

    if blocked_zone_count >= 2:
        return "evacuation"

    if severity_index >= 35 or impacted_zone_count >= 1:
        return "response"

    return "monitor"


def executive_status(severity_index: int) -> str:
    if severity_index >= 80:
        return "command escalation required"

    if severity_index >= 50:
        return "leadership attention"

    return "stable"
