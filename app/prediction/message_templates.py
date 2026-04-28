from __future__ import annotations


def occupant_evacuation_message(zone: str, destination: str | None = None) -> str:
    if destination:
        return f"Evacuate {zone} immediately and move toward {destination}."

    return f"Evacuate {zone} immediately using the nearest safe corridor."


def occupant_prepare_message(zone: str) -> str:
    return f"Prepare occupants in {zone} to relocate and await guided movement."


def occupant_safe_message(zone: str) -> str:
    return f"Remain calm in {zone} and await further instruction."


def responder_fire_message(zone: str) -> str:
    return f"Deploy suppression team to {zone} and secure the primary corridor."


def responder_medical_message(zone: str) -> str:
    return f"Stage medical triage near {zone} and prepare for smoke exposure cases."


def responder_security_message(zone: str) -> str:
    return f"Reinforce the {zone} perimeter and keep evacuation lanes clear."
