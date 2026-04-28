from __future__ import annotations

from app.communications.delivery_queue import (
    get_queue_snapshot,
    get_recent_events,
    mark_retry_success,
    pending_or_failed_records,
    record_failure,
    record_sent,
    update_failure,
)
from app.communications.providers import get_provider_statuses
from app.communications.schemas import (
    CommunicationAlertItem,
    DeliveryStatus,
)
from app.integrations.n8n import (
    emit_n8n_events,
    get_n8n_status,
    post_webhook_sync,
    webhook_configured,
)
from app.models.incident import Incident
from app.perception.fusion import generate_fusion_snapshot
from app.prediction.resources import generate_resource_deployments


def _severity_from_state(state: str) -> str:
    mapping = {
        "stable": "normal",
        "watch": "elevated",
        "elevated": "high",
        "critical": "critical",
    }
    return mapping.get(state, "normal")


def _channels_for_level(level: str) -> list[str]:
    if level == "critical":
        return ["in_app", "sms", "email", "voice", "siren"]
    if level == "high":
        return ["in_app", "sms", "email"]
    if level == "elevated":
        return ["in_app", "email"]
    return ["in_app"]


def _stable_seed(*parts: object) -> int:
    return sum(ord(character) for character in "|".join(str(part) for part in parts))


def _delivery_state(*parts: object) -> str:
    return "queued" if _stable_seed(*parts) % 10 == 0 else "sent"


def _receipt_id(*parts: object) -> str:
    return f"COMM-{_stable_seed(*parts) % 100000:05d}"


def _webhook_receipt_id(*parts: object) -> str:
    return f"WEB-{_stable_seed(*parts) % 100000:05d}"


def _delivery_metrics(alerts: list[CommunicationAlertItem]) -> DeliveryStatus:
    queued = 0
    sent = 0

    for alert in alerts:
        for channel in alert.channels:
            state = _delivery_state(alert.zone, channel, alert.priority, alert.message)
            if state == "queued":
                queued += 1
            else:
                sent += 1

    return DeliveryStatus(queued=queued, sent=sent, failed=0)


def _active_channels(alerts: list[CommunicationAlertItem]) -> list[str]:
    ordered: list[str] = []
    seen: set[str] = set()

    for alert in alerts:
        for channel in alert.channels:
            if channel in seen:
                continue
            seen.add(channel)
            ordered.append(channel)

    return ordered


def _global_level(alerts: list[CommunicationAlertItem]) -> str:
    if not alerts:
        return "normal"

    priority_rank = {"normal": 0, "elevated": 1, "high": 2, "critical": 3}
    return max(alerts, key=lambda item: priority_rank[item.priority]).priority


def _build_alerts(incidents: list[Incident]) -> tuple[list[CommunicationAlertItem], list[str]]:
    fusion = generate_fusion_snapshot(incidents)
    resources = generate_resource_deployments(incidents)
    zone_incidents: dict[str, set[str]] = {}
    for incident in incidents:
        if incident.status != "active":
            continue
        zone_incidents.setdefault(incident.location, set()).add(incident.type)

    alerts: list[CommunicationAlertItem] = []
    templates_used: list[str] = []

    for zone in fusion["zones"]:
        priority = _severity_from_state(zone.state)
        if zone.fused_score >= 80:
            alerts.append(
                CommunicationAlertItem(
                    zone=zone.zone,
                    priority=priority,
                    title="Immediate Evacuation",
                    message=f"Move immediately away from {zone.zone} toward the safest open corridor.",
                    channels=_channels_for_level(priority),
                    audience="occupants",
                )
            )
            templates_used.append("critical_evacuation_v1")
        elif zone.fused_score >= 60:
            alerts.append(
                CommunicationAlertItem(
                    zone=zone.zone,
                    priority=priority,
                    title="Evacuation Preparation",
                    message=f"Prepare to relocate from {zone.zone} and await corridor routing updates.",
                    channels=_channels_for_level(priority),
                    audience="occupants",
                )
            )
            templates_used.append("elevated_prepare_v1")

    for deployment in resources["deployments"][:3]:
        if deployment.priority not in {"high", "critical"}:
            continue
        channels = ["in_app", "sms"]
        if deployment.priority == "critical":
            channels.append("whatsapp")
        alerts.append(
            CommunicationAlertItem(
                zone=deployment.zone,
                priority=deployment.priority,
                title="Responder Deployment",
                message=f"Deploy response package to {deployment.zone} and confirm perimeter control.",
                channels=channels,
                audience="responders",
            )
        )
        templates_used.append("responder_dispatch_v1")

    if resources["global_load"] == "overloaded":
        impacted_zones = [zone.zone for zone in fusion["zones"] if zone.fused_score >= 60][:3]
        alerts.append(
            CommunicationAlertItem(
                zone=impacted_zones[0] if impacted_zones else "Zone 1",
                priority="critical",
                title="Executive Escalation",
                message="Resource load is overloaded. Executive coordination and external support readiness required.",
                channels=["email", "whatsapp", "executive_notice"],
                audience="executives",
            )
        )
        templates_used.append("executive_escalation_v1")

    deduped_templates: list[str] = []
    for template in templates_used:
        if template not in deduped_templates:
            deduped_templates.append(template)

    return alerts, deduped_templates


def _next_actions(alerts: list[CommunicationAlertItem], delivery_status: DeliveryStatus) -> list[str]:
    actions: list[str] = []
    if delivery_status.queued > 0:
        actions.append("Re-alert queued recipients if no acknowledgement")

    for alert in alerts[:3]:
        if alert.priority == "critical" and alert.audience == "occupants":
            actions.append(f"Re-alert {alert.zone} if no acknowledgement")
        elif alert.audience == "executives":
            actions.append("Escalate executive briefing if conditions worsen")

    deduped: list[str] = []
    for action in actions:
        if action not in deduped:
            deduped.append(action)

    return deduped[:4] if deduped else ["Maintain active communications monitoring"]


def generate_live_communications(incidents: list[Incident]) -> dict[str, object]:
    alerts, templates_used = _build_alerts(incidents)
    delivery_status = _delivery_metrics(alerts)

    return {
        "global_level": _global_level(alerts),
        "active_channels": _active_channels(alerts),
        "alerts": alerts,
        "delivery_status": delivery_status,
        "templates_used": templates_used,
        "next_actions": _next_actions(alerts, delivery_status),
        "n8n_status": get_n8n_status(),
    }


async def send_test_alert(channel: str, target: str, message: str) -> dict[str, object]:
    receipt_id = _receipt_id(channel, target, message)
    status = _delivery_state(channel, target, message)
    events: list[tuple[str, dict[str, object]]] = [
        (
            "alert.created",
            {
                "zone": target,
                "priority": "normal",
                "channels": [channel],
                "message": message,
            },
        )
    ]
    if status == "sent":
        events.append(
            (
                "alert.sent",
                {
                    "receipt_id": receipt_id,
                    "channel": channel,
                    "target": target,
                },
            )
        )
    elif status == "failed":
        events.append(
            (
                "alert.failed",
                {
                    "receipt_id": receipt_id,
                    "channel": channel,
                    "target": target,
                },
            )
        )

    n8n_triggered = await emit_n8n_events(events)
    return {
        "status": status,
        "receipt_id": receipt_id,
        "n8n_triggered": n8n_triggered,
    }


async def broadcast_alert(severity: str, zones: list[str], message: str) -> dict[str, object]:
    channels = _channels_for_level(severity)
    events: list[tuple[str, dict[str, object]]] = []
    fanout_count = len(zones) * len(channels)

    for zone in zones:
        events.append(
            (
                "alert.created",
                {
                    "zone": zone,
                    "priority": severity,
                    "channels": channels,
                    "message": message,
                },
            )
        )

    if severity == "critical":
        events.append(
            (
                "escalation.triggered",
                {
                    "level": severity,
                    "zones": zones,
                },
            )
        )

    events.append(
        (
            "broadcast.completed",
            {
                "severity": severity,
                "zones": zones,
                "channels": channels,
                "fanout_count": fanout_count,
            },
        )
    )

    n8n_triggered = await emit_n8n_events(events)
    return {
        "status": "completed",
        "fanout_count": fanout_count,
        "channels": channels,
        "n8n_triggered": n8n_triggered,
    }


def get_integrations_overview() -> dict[str, object]:
    return {
        "n8n_status": get_n8n_status(),
        "webhook_configured": webhook_configured(),
        "providers": get_provider_statuses(webhook_configured()),
        "queue": get_queue_snapshot(),
        "recent_events": get_recent_events()[:5],
    }


async def test_webhook_delivery(event: str, channel: str) -> dict[str, object]:
    payload = {
        "priority": "critical",
        "zone": "Zone 2",
        "message": "Evacuate immediately",
        "channel": channel,
    }
    receipt_id = _webhook_receipt_id(event, channel)
    success, response_text = post_webhook_sync(event, payload)

    if success:
        record_sent(
            receipt_id=receipt_id,
            event=event,
            channel=channel,
            payload=payload,
            provider="n8n",
            response=response_text,
        )
        return {
            "status": "delivered",
            "provider": "n8n",
            "webhook_response": response_text,
            "receipt_id": receipt_id,
        }

    record_failure(
        receipt_id=receipt_id,
        event=event,
        channel=channel,
        payload=payload,
        provider="n8n",
        attempts=1,
        response=response_text,
    )
    return {
        "status": "queued",
        "provider": "n8n",
        "webhook_response": response_text,
        "receipt_id": receipt_id,
    }


async def retry_failed_deliveries() -> dict[str, object]:
    retried = 0

    for record in pending_or_failed_records():
        success, response_text = post_webhook_sync(record.event, record.payload)
        retried += 1

        if success:
            mark_retry_success(record, response_text)
        else:
            update_failure(record, response_text)

    remaining_failed = get_queue_snapshot()["failed"]
    return {
        "status": "completed",
        "retried": retried,
        "remaining_failed": remaining_failed,
    }
