from __future__ import annotations

from typing import Any


PLAYBOOKS: dict[str, dict[str, Any]] = {
    "fire": {
        "primary": "Protect evacuation corridor, dispatch fire suppression, stage medical triage.",
        "fallback": "Compartmentalize zone and hold responders outside smoke boundary.",
    },
    "gas": {
        "primary": "Shut down HVAC, isolate affected corridor, route responders upwind.",
        "fallback": "Shelter adjacent zones until air quality verifies safe egress.",
    },
    "panic": {
        "primary": "Open guided exit lanes, slow inflow, push calm public instructions.",
        "fallback": "Freeze entry gates and create supervised assembly lanes.",
    },
    "intrusion": {
        "primary": "Lock affected corridor, track CCTV metadata, dispatch security sweep.",
        "fallback": "Move to manual control and preserve life-safety exits.",
    },
    "cyber": {
        "primary": "Shift to advisory mode, protect auth, freeze sensitive controls.",
        "fallback": "Manual command channel with audit-only automation.",
    },
    "power": {
        "primary": "Activate backup power, prioritize critical systems, dispatch facility team.",
        "fallback": "Offline local mode with siren and field task queue.",
    },
    "misinformation": {
        "primary": "Issue verified public statement, monitor rumor spread, brief executives.",
        "fallback": "Advisory-only external comms with SOC misinformation watch.",
    },
    "storm": {
        "primary": "Pre-stage responders, protect power systems, slow outdoor movement, and route evacuation away from flood-prone corridors.",
        "fallback": "Move to shelter-in-place posture while preserving generator-backed command channels.",
    },
}


def get_playbook(threat_key: str) -> dict[str, str]:
    return PLAYBOOKS.get(threat_key, PLAYBOOKS["fire"])
