from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone

from app.communications.engine import generate_live_communications
from app.communications.roles import generate_role_communications
from app.communications.schemas import AcknowledgementItem, AckTotals
from app.integrations.n8n import emit_n8n_events, get_n8n_status
from app.models.incident import Incident
from app.perception.fusion import generate_fusion_snapshot
from app.simulation.twin import generate_live_twin_state


@dataclass
class StoredAcknowledgement:
    id: str
    zone: str
    role: str
    status: str
    priority: str
    message: str
    received_at: datetime


_ack_records: list[StoredAcknowledgement] = []
_ack_counter = 1000


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _next_ack_id() -> str:
    global _ack_counter
    _ack_counter += 1
    return f"ACK-{_ack_counter}"


def _canonical_status(status: str) -> str:
    return status.strip().lower()


def _priority_for_status(status: str) -> str:
    mapping = {
        "safe": "normal",
        "evacuated": "normal",
        "on_site": "elevated",
        "team_deployed": "elevated",
        "need_help": "high",
        "medical_required": "critical",
        "trapped": "critical",
        "false_alarm": "low",
    }
    return mapping[_canonical_status(status)]


def _to_item(record: StoredAcknowledgement) -> AcknowledgementItem:
    return AcknowledgementItem(
        id=record.id,
        zone=record.zone,
        role=record.role,
        status=record.status,
        priority=record.priority,
        message=record.message,
        received_at=record.received_at,
    )


def _synthetic_message(zone: str, status: str) -> str:
    if status == "need_help":
        return f"Assistance needed near {zone} stairwell."
    if status == "trapped":
        return f"Occupants trapped near {zone} interior corridor."
    if status == "evacuated":
        return f"Evacuation confirmed from {zone}."
    if status == "safe":
        return f"Reached safe area away from {zone}."
    return f"Status update received from {zone}."


def _synthetic_responses(incidents: list[Incident]) -> list[AcknowledgementItem]:
    if _ack_records:
        return []

    fusion = generate_fusion_snapshot(incidents)
    twin = generate_live_twin_state(incidents)
    occupancy_map = {zone.zone: zone.occupancy for zone in twin["zones"]}
    synthetic: list[AcknowledgementItem] = []

    for zone in fusion["zones"][:3]:
        status: str | None = None

        if zone.state == "critical":
            status = "need_help"
            if occupancy_map.get(zone.zone, 0) >= 80:
                status = "trapped"
        elif zone.state == "elevated":
            status = "evacuated"
        elif zone.state == "watch":
            status = "safe"

        if status is None:
            continue

        synthetic.append(
            AcknowledgementItem(
                id=f"SYN-{zone.zone.replace(' ', '')}",
                zone=zone.zone,
                role="occupants",
                status=status,
                priority=_priority_for_status(status),
                message=_synthetic_message(zone.zone, status),
                received_at=_now(),
            )
        )

    return synthetic


def _all_response_items(incidents: list[Incident]) -> list[AcknowledgementItem]:
    manual_items = [_to_item(record) for record in _ack_records]
    return sorted(
        manual_items + _synthetic_responses(incidents),
        key=lambda item: item.received_at,
        reverse=True,
    )


def _totals(alerts_sent: int, responses: list[AcknowledgementItem]) -> AckTotals:
    acknowledged = sum(
        1
        for item in responses
        if item.status in {"safe", "on_site", "team_deployed", "false_alarm"}
    )
    need_help = sum(1 for item in responses if item.status in {"need_help", "medical_required"})
    trapped = sum(1 for item in responses if item.status == "trapped")
    evacuated = sum(1 for item in responses if item.status == "evacuated")
    pending = max(0, alerts_sent - len(responses))

    return AckTotals(
        alerts_sent=alerts_sent,
        acknowledged=acknowledged,
        need_help=need_help,
        trapped=trapped,
        evacuated=evacuated,
        pending=pending,
    )


def _global_level(responses: list[AcknowledgementItem], base_level: str) -> str:
    if any(item.status in {"trapped", "medical_required"} for item in responses):
        return "critical"
    if any(item.status == "need_help" for item in responses):
        return "high"
    return base_level


def _hotspots(responses: list[AcknowledgementItem]) -> list[str]:
    zone_scores: dict[str, int] = {}
    for item in responses:
        zone_scores[item.zone] = zone_scores.get(item.zone, 0) + (
            3 if item.status in {"trapped", "medical_required"} else 2 if item.status == "need_help" else 1
        )

    return [
        zone
        for zone, _score in sorted(zone_scores.items(), key=lambda item: (-item[1], item[0]))[:3]
    ]


def _recommended_actions(responses: list[AcknowledgementItem], totals: AckTotals) -> list[str]:
    actions: list[str] = []

    for item in responses:
        if item.status == "trapped":
            actions.append(f"Dispatch rescue support to {item.zone}")
        elif item.status == "medical_required":
            actions.append(f"Dispatch medical support to {item.zone}")
        elif item.status == "need_help":
            actions.append(f"Dispatch rescue support to {item.zone}")

    if totals.pending > 0:
        hotspots = _hotspots(responses)
        if hotspots:
            actions.append(f"Re-alert pending users in {hotspots[0]}")

    deduped: list[str] = []
    for action in actions:
        if action not in deduped:
            deduped.append(action)

    return deduped[:4] if deduped else ["Maintain active acknowledgement monitoring"]


def generate_acknowledgement_snapshot(incidents: list[Incident]) -> dict[str, object]:
    live_comms = generate_live_communications(incidents)
    role_comms = generate_role_communications(incidents)
    alerts_sent = len(live_comms["alerts"]) + len(role_comms["messages"])
    responses = _all_response_items(incidents)
    totals = _totals(alerts_sent, responses)

    return {
        "global_level": _global_level(responses, live_comms["global_level"]),
        "totals": totals,
        "responses": responses[:8],
        "hotspots": _hotspots(responses),
        "recommended_actions": _recommended_actions(responses, totals),
        "n8n_status": get_n8n_status(),
    }


async def submit_ack_response(zone: str, role: str, status: str, message: str) -> dict[str, object]:
    canonical_status = _canonical_status(status)
    priority = _priority_for_status(canonical_status)
    record = StoredAcknowledgement(
        id=_next_ack_id(),
        zone=zone,
        role=role,
        status=canonical_status,
        priority=priority,
        message=message,
        received_at=_now(),
    )
    _ack_records.append(record)

    events: list[tuple[str, dict[str, object]]] = [
        (
            "ack.received",
            {
                "zone": zone,
                "role": role,
                "status": canonical_status,
                "message": message,
            },
        )
    ]
    if canonical_status == "need_help":
        events.append(
            (
                "ack.need_help",
                {
                    "zone": zone,
                    "role": role,
                    "message": message,
                },
            )
        )
    elif canonical_status == "trapped":
        events.append(
            (
                "ack.trapped",
                {
                    "zone": zone,
                    "role": role,
                    "message": message,
                },
            )
        )
    elif canonical_status == "medical_required":
        events.append(
            (
                "ack.medical",
                {
                    "zone": zone,
                    "role": role,
                    "message": message,
                },
            )
        )

    n8n_triggered = await emit_n8n_events(events)
    return {
        "status": "received",
        "ack_id": record.id,
        "priority": priority,
        "n8n_triggered": n8n_triggered,
    }


async def submit_bulk_test(zone: str, count: int, status: str) -> dict[str, object]:
    created = 0
    for index in range(count):
        await submit_ack_response(
            zone,
            "occupants",
            status,
            f"Bulk response {index + 1} from {zone}",
        )
        created += 1

    n8n_triggered = await emit_n8n_events(
        [
            (
                "ack.bulk_ingested",
                {
                    "zone": zone,
                    "count": count,
                    "status": _canonical_status(status),
                },
            )
        ]
    )
    return {
        "status": "completed",
        "created": created,
        "n8n_triggered": n8n_triggered,
    }
