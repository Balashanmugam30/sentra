from __future__ import annotations

from app.communications.engine import (
    _delivery_metrics,
    _delivery_state,
    _receipt_id,
    _severity_from_state,
)
from app.communications.schemas import RoleMessageItem
from app.integrations.n8n import emit_n8n_events, get_n8n_status
from app.models.incident import Incident
from app.perception.fusion import generate_fusion_snapshot
from app.prediction.resources import generate_resource_deployments
from app.simulation.twin import generate_live_twin_state


def _channels_for_role(role: str) -> list[str]:
    mapping = {
        "occupants": ["in_app", "sms", "voice"],
        "responders": ["radio", "whatsapp", "in_app"],
        "executives": ["email", "whatsapp"],
        "security": ["radio", "in_app"],
        "medical": ["radio", "whatsapp"],
        "facility_staff": ["in_app", "email"],
    }
    return mapping[role]


def _severity_rank(priority: str) -> int:
    return {"normal": 0, "elevated": 1, "high": 2, "critical": 3}.get(priority, 0)


def _high_casualty_probability(twin: dict[str, object], fusion: dict[str, object]) -> bool:
    fused_map = {zone.zone: zone for zone in fusion["zones"]}
    return any(
        zone.occupancy >= 70 and getattr(fused_map.get(zone.zone), "fused_score", 0) >= 70
        for zone in twin["zones"]
    )


def _device_issue_detected(incidents: list[Incident]) -> bool:
    return any(incident.type in {"hazardous_gas", "fire", "anomaly"} for incident in incidents if incident.status == "active")


def _active_roles(messages: list[RoleMessageItem]) -> list[str]:
    ordered: list[str] = []
    seen: set[str] = set()

    for message in messages:
        if message.role in seen:
            continue
        seen.add(message.role)
        ordered.append(message.role)

    return ordered


def _global_level(messages: list[RoleMessageItem]) -> str:
    if not messages:
        return "normal"

    return max(messages, key=lambda item: _severity_rank(item.priority)).priority


def build_role_messages(incidents: list[Incident]) -> list[RoleMessageItem]:
    fusion = generate_fusion_snapshot(incidents)
    resources = generate_resource_deployments(incidents)
    twin = generate_live_twin_state(incidents)
    messages: list[RoleMessageItem] = []

    for zone in fusion["zones"]:
        if zone.fused_score >= 70:
            action = (
                "Move now toward the safest active corridor."
                if zone.state == "critical"
                else "Prepare to reroute and await corridor confirmation."
            )
            messages.append(
                RoleMessageItem(
                    role="occupants",
                    zone=zone.zone,
                    priority=_severity_from_state(zone.state),
                    title="Immediate Evacuation" if zone.state == "critical" else "Evacuation Advisory",
                    message=action,
                    channels=_channels_for_role("occupants"),
                )
            )

    for deployment in resources["deployments"][:4]:
        if deployment.priority not in {"high", "critical"}:
            continue

        incident_types = {
            incident.type
            for incident in incidents
            if incident.status == "active" and incident.location == deployment.zone
        }
        if "hazardous_gas" in incident_types:
            responder_message = f"Fire + Hazmat + Perimeter team to {deployment.zone}."
        elif "crowd_panic" in incident_types:
            responder_message = f"Security + Medical stabilization package to {deployment.zone}."
        else:
            responder_message = f"Fire + Medical + Perimeter team to {deployment.zone}."

        messages.append(
            RoleMessageItem(
                role="responders",
                zone=deployment.zone,
                priority=deployment.priority,
                title="Deploy Response Package",
                message=responder_message,
                channels=_channels_for_role("responders"),
            )
        )

    if resources["global_load"] == "overloaded" or any(zone.state == "critical" for zone in fusion["zones"]):
        top_zone = fusion["zones"][0].zone if fusion["zones"] else "HQ"
        messages.append(
            RoleMessageItem(
                role="executives",
                zone="HQ",
                priority="high" if resources["global_load"] != "overloaded" else "critical",
                title="Executive Brief",
                message=f"{top_zone} critical. Resource overload likely in 10 min." if resources["global_load"] == "overloaded" else f"{top_zone} trending critical. Executive oversight advised.",
                channels=_channels_for_role("executives"),
            )
        )

    risky_corridor_zone = next((zone.zone for zone in fusion["zones"] if "incoming fire spread" in zone.drivers), None)
    if twin["global_mode"] in {"lockdown", "evacuation"} or risky_corridor_zone is not None:
        security_zone = risky_corridor_zone or fusion["zones"][0].zone
        messages.append(
            RoleMessageItem(
                role="security",
                zone=security_zone,
                priority="critical" if twin["global_mode"] == "lockdown" else "high",
                title="Perimeter Control",
                message=f"Secure exits, isolate {security_zone}, and clear evacuation lanes.",
                channels=_channels_for_role("security"),
            )
        )

    if _high_casualty_probability(twin, fusion):
        fused_map = {zone.zone: zone for zone in fusion["zones"]}
        medical_zone = next(
            (
                zone.zone
                for zone in twin["zones"]
                if zone.occupancy >= 70 and getattr(fused_map.get(zone.zone), "fused_score", 0) >= 70
            ),
            fusion["zones"][0].zone,
        )
        medical_fused = fused_map.get(medical_zone)
        messages.append(
            RoleMessageItem(
                role="medical",
                zone=medical_zone,
                priority="critical" if getattr(medical_fused, "state", "elevated") == "critical" else "high",
                title="Casualty Readiness",
                message=f"Prepare triage, oxygen support, and ambulance staging near {medical_zone}.",
                channels=_channels_for_role("medical"),
            )
        )

    if _device_issue_detected(incidents):
        staff_zone = next((incident.location for incident in incidents if incident.status == "active"), "Zone 1")
        messages.append(
            RoleMessageItem(
                role="facility_staff",
                zone=staff_zone,
                priority="high",
                title="Facility Systems Action",
                message=f"Shut down HVAC, unlock exits, and inspect alarm systems near {staff_zone}.",
                channels=_channels_for_role("facility_staff"),
            )
        )

    return messages


def generate_role_communications(incidents: list[Incident]) -> dict[str, object]:
    messages = build_role_messages(incidents)
    delivery_summary = _delivery_metrics(messages)

    next_escalations: list[str] = []
    for message in messages:
        if message.role == "medical" and message.priority in {"high", "critical"}:
            next_escalations.append("Escalate medical team standby")
        if message.role == "occupants" and message.priority == "critical":
            next_escalations.append(f"Re-alert {message.zone} occupants if no acknowledgement")
        if message.role == "executives" and message.priority == "critical":
            next_escalations.append("Prepare executive external support briefing")

    deduped_escalations: list[str] = []
    for escalation in next_escalations:
        if escalation not in deduped_escalations:
            deduped_escalations.append(escalation)

    return {
        "global_level": _global_level(messages),
        "roles_active": _active_roles(messages),
        "messages": messages,
        "delivery_summary": delivery_summary,
        "next_escalations": deduped_escalations[:4],
        "n8n_status": get_n8n_status(),
    }


async def send_role_test(role: str, zone: str) -> dict[str, object]:
    receipt_id = f"ROLE-{_receipt_id(role, zone).split('-', 1)[1]}"
    status = _delivery_state(role, zone, "role-test")
    events: list[tuple[str, dict[str, object]]] = [
        (
            "role.message.created",
            {
                "role": role,
                "zone": zone,
                "priority": "normal",
            },
        )
    ]
    if status == "sent":
        events.append(
            (
                "role.message.sent",
                {
                    "role": role,
                    "zone": zone,
                    "receipt_id": receipt_id,
                },
            )
        )

    if role in {"executives", "medical"}:
        events.append(
            (
                "role.escalation.triggered",
                {
                    "role": role,
                    "zone": zone,
                },
            )
        )

    n8n_triggered = await emit_n8n_events(events)
    return {
        "status": status,
        "role": role,
        "zone": zone,
        "receipt_id": receipt_id,
        "n8n_triggered": n8n_triggered,
    }
