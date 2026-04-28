from __future__ import annotations

from typing import Literal


GovernanceRole = Literal[
    "commander",
    "executive",
    "facility_admin",
    "security_lead",
    "operator",
    "commander_or_executive",
]

APPROVAL_POLICIES: dict[str, GovernanceRole] = {
    "full_lockdown": "commander",
    "mutual_aid": "executive",
    "hvac_shutdown": "facility_admin",
    "door_unlock_global": "security_lead",
    "mass_alert_all": "commander_or_executive",
    "budget_over_threshold": "executive",
}

ROLE_SEQUENCE: list[GovernanceRole] = [
    "commander",
    "executive",
    "facility_admin",
    "security_lead",
]


def required_role_for_action(action_name: str | None, fallback_role: str | None = None) -> str:
    if action_name and action_name in APPROVAL_POLICIES:
        return APPROVAL_POLICIES[action_name]
    return fallback_role or "commander"


def actor_matches_role(actor: str, required_role: str) -> bool:
    if required_role == "commander_or_executive":
        return actor in {"commander", "executive"}
    return actor == required_role


def next_role(required_role: str) -> str:
    if required_role == "commander_or_executive":
        return "executive"
    if required_role not in ROLE_SEQUENCE:
        return "executive"
    index = ROLE_SEQUENCE.index(required_role)
    return ROLE_SEQUENCE[(index + 1) % len(ROLE_SEQUENCE)]
