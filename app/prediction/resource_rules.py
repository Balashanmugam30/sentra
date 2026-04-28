from __future__ import annotations

from typing import Literal


ResourcePriority = Literal["low", "medium", "high", "critical"]

DEFAULT_RESOURCE_POOL = {
    "fire_teams": 6,
    "medical_teams": 4,
    "security_teams": 5,
    "drones": 3,
}


def classify_priority(score: int) -> ResourcePriority:
    if score >= 120:
        return "critical"

    if score >= 80:
        return "high"

    if score >= 40:
        return "medium"

    return "low"


def default_eta(priority: ResourcePriority) -> int:
    if priority == "critical":
        return 3

    if priority == "high":
        return 5

    if priority == "medium":
        return 8

    return 12


def containment_eta(priority: ResourcePriority) -> int:
    if priority == "critical":
        return 12

    if priority == "high":
        return 18

    if priority == "medium":
        return 25

    return 0
