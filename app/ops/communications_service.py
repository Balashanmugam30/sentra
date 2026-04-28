from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.ops.communications_store import ops_communications_store


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


CHANNELS: list[dict[str, Any]] = [
    {"channel": "in_app", "label": "In-app", "queued": 12, "sent": 1280, "delivered": 1268, "failed": 2, "retried": 4, "acked": 948, "success_rate": 99},
    {"channel": "sms", "label": "SMS", "queued": 28, "sent": 1180, "delivered": 1116, "failed": 18, "retried": 46, "acked": 734, "success_rate": 95},
    {"channel": "email", "label": "Email", "queued": 7, "sent": 1240, "delivered": 1202, "failed": 9, "retried": 22, "acked": 611, "success_rate": 97},
    {"channel": "whatsapp", "label": "WhatsApp", "queued": 15, "sent": 940, "delivered": 906, "failed": 11, "retried": 19, "acked": 702, "success_rate": 96},
    {"channel": "slack", "label": "Slack", "queued": 2, "sent": 210, "delivered": 209, "failed": 0, "retried": 1, "acked": 188, "success_rate": 100},
    {"channel": "teams", "label": "Teams", "queued": 3, "sent": 176, "delivered": 172, "failed": 1, "retried": 2, "acked": 150, "success_rate": 98},
    {"channel": "webhook", "label": "n8n Webhook", "queued": 4, "sent": 82, "delivered": 80, "failed": 1, "retried": 3, "acked": 72, "success_rate": 98},
    {"channel": "voice", "label": "Voice mock", "queued": 6, "sent": 322, "delivered": 304, "failed": 8, "retried": 12, "acked": 211, "success_rate": 94},
]


AUDIENCES: list[dict[str, Any]] = [
    {"audience_id": "all_users", "label": "All users", "count": 1280, "scope": "tenant", "risk": "high"},
    {"audience_id": "responders", "label": "Responders", "count": 42, "scope": "role", "risk": "medium"},
    {"audience_id": "executives", "label": "Executives", "count": 12, "scope": "role", "risk": "medium"},
    {"audience_id": "security", "label": "Security teams", "count": 74, "scope": "role", "risk": "medium"},
    {"audience_id": "occupants", "label": "Occupants", "count": 1034, "scope": "role", "risk": "high"},
    {"audience_id": "zone_3", "label": "Zone 3 users", "count": 428, "scope": "zone", "risk": "critical"},
    {"audience_id": "grand_meridian", "label": "Grand Meridian Hotel", "count": 1280, "scope": "building", "risk": "high"},
    {"audience_id": "incident_fire_001", "label": "Incident-linked users", "count": 512, "scope": "incident", "risk": "critical"},
]


TEMPLATES: list[dict[str, Any]] = [
    {"template_id": "fire_evacuation", "title": "Fire evacuation", "severity": "critical", "body": "Fire detected in Zone 3. Proceed to Exit B. Do not use elevators.", "recommended_channels": ["in_app", "sms", "voice", "webhook"]},
    {"template_id": "gas_leak", "title": "Gas leak isolate area", "severity": "critical", "body": "Gas anomaly detected. Avoid basement corridors and follow staff instructions.", "recommended_channels": ["in_app", "sms", "whatsapp", "webhook"]},
    {"template_id": "severe_weather", "title": "Severe weather shelter", "severity": "warning", "body": "Move away from glass and shelter in marked interior zones.", "recommended_channels": ["in_app", "email", "sms"]},
    {"template_id": "lockdown", "title": "Lockdown", "severity": "critical", "body": "Lockdown active. Stay inside, silence devices, await verified instructions.", "recommended_channels": ["in_app", "sms", "voice", "teams"]},
    {"template_id": "medical_emergency", "title": "Medical emergency", "severity": "high", "body": "Medical team dispatched. Keep corridor clear and report if assistance is needed.", "recommended_channels": ["in_app", "slack", "teams"]},
    {"template_id": "executive_board_brief", "title": "Executive board brief", "severity": "high", "body": "Incident response active. Current status, risk, and recovery ETA are attached.", "recommended_channels": ["email", "teams", "webhook"]},
    {"template_id": "responder_dispatch", "title": "Responder dispatch", "severity": "high", "body": "Responder assignment updated. Confirm ETA and route status.", "recommended_channels": ["in_app", "sms", "slack"]},
    {"template_id": "holding_statement", "title": "Public holding statement", "severity": "medium", "body": "We are responding to an operational incident and will provide verified updates shortly.", "recommended_channels": ["email", "webhook"]},
]


SCENARIOS: list[dict[str, str]] = [
    {"scenario_id": "zone_3_fire", "label": "Zone 3 fire evacuation"},
    {"scenario_id": "gas_silent_floor", "label": "Gas leak silent floor"},
    {"scenario_id": "lockdown_partial_ack", "label": "Lockdown with partial ack"},
    {"scenario_id": "weather_mass_alert", "label": "Mass weather alert"},
    {"scenario_id": "responder_dispatch", "label": "Responder dispatch success"},
]


BASE_RESPONSES: dict[str, int] = {
    "safe": 318,
    "need_help": 18,
    "trapped": 6,
    "evacuated": 241,
    "on_route": 174,
    "acknowledged": 872,
    "silent": 86,
}


ZONE_STATUS: list[dict[str, Any]] = [
    {"zone": "Kitchen Zone B", "building": "Grand Meridian Hotel", "acknowledged": 86, "silent": 14, "help_requests": 5, "trapped": 2, "evacuation_complete": 72, "risk": "critical"},
    {"zone": "Floor 3 East", "building": "Grand Meridian Hotel", "acknowledged": 92, "silent": 8, "help_requests": 3, "trapped": 1, "evacuation_complete": 81, "risk": "high"},
    {"zone": "Floor 3 West", "building": "Grand Meridian Hotel", "acknowledged": 77, "silent": 23, "help_requests": 6, "trapped": 3, "evacuation_complete": 64, "risk": "high"},
    {"zone": "Lobby", "building": "Grand Meridian Hotel", "acknowledged": 96, "silent": 4, "help_requests": 1, "trapped": 0, "evacuation_complete": 91, "risk": "watch"},
]


SILENCE_ESCALATIONS: list[dict[str, Any]] = [
    {"escalation_id": "SIL-Z3-001", "target": "Floor 3 West", "silent_count": 23, "last_channel": "sms", "next_action": "Resend via voice + in-app", "priority": "critical", "owner": "Comms Desk"},
    {"escalation_id": "SIL-KIT-002", "target": "Kitchen Zone B", "silent_count": 14, "last_channel": "whatsapp", "next_action": "Notify security manager for welfare check", "priority": "high", "owner": "Security Bravo"},
    {"escalation_id": "SIL-STAFF-003", "target": "Facilities staff pool", "silent_count": 5, "last_channel": "teams", "next_action": "Route through Slack and deputy lead", "priority": "medium", "owner": "Facilities Lead"},
]


def _response_counts(state: dict[str, Any]) -> dict[str, int]:
    counts = dict(BASE_RESPONSES)
    for response in state["responses"]:
        key = str(response["response"]).lower()
        if key in counts:
            counts[key] += 1
            counts["silent"] = max(0, counts["silent"] - 1)
    return counts


def _feed(state: dict[str, Any]) -> list[dict[str, Any]]:
    seeded = [
        {"timestamp": _now_iso(), "event": "Fire evacuation broadcast", "detail": "Zone 3 alert delivered across in-app, SMS, voice, and n8n webhook.", "status": "delivered"},
        {"timestamp": _now_iso(), "event": "Ack surge detected", "detail": "Floor 3 East crossed 90% acknowledgement in under 2 minutes.", "status": "acked"},
        {"timestamp": _now_iso(), "event": "Help request cluster", "detail": "Six occupants reported assistance needed near Floor 3 West corridor.", "status": "needs_attention"},
        {"timestamp": _now_iso(), "event": "Silence escalation armed", "detail": "Floor 3 West silence rate remains above threshold.", "status": "escalated"},
    ]
    return [*state["sent_messages"], *seeded][-16:]


def _analytics(response_counts: dict[str, int]) -> dict[str, Any]:
    total = sum(response_counts.values())
    silent_percent = round((response_counts["silent"] / max(1, total)) * 100)
    return {
        "delivery_success_percent": 97,
        "avg_ack_time": "1m 48s",
        "silent_user_percent": silent_percent,
        "escalations_triggered": len(SILENCE_ESCALATIONS),
        "help_requests_handled": 22,
        "channel_performance": [
            {"channel": channel["label"], "success_rate": channel["success_rate"], "acked": channel["acked"]}
            for channel in CHANNELS
        ],
        "zone_response_ranking": [
            {"zone": zone["zone"], "acknowledged": zone["acknowledged"], "evacuation_complete": zone["evacuation_complete"]}
            for zone in sorted(ZONE_STATUS, key=lambda item: int(item["acknowledged"]), reverse=True)
        ],
    }


def build_communications_snapshot() -> dict[str, Any]:
    state = ops_communications_store.get_state()
    counts = _response_counts(state)
    reached = sum(channel["delivered"] for channel in CHANNELS if channel["channel"] in {"in_app", "sms"})
    return {
        "generated_at": _now_iso(),
        "mode": "demo",
        "scenario": state["scenario"],
        "scenarios": SCENARIOS,
        "composer": {
            "default_template_id": "fire_evacuation",
            "default_audience_id": "zone_3",
            "default_channels": ["in_app", "sms", "voice", "webhook"],
            "severity": "critical",
        },
        "channels": CHANNELS,
        "audiences": AUDIENCES,
        "templates": TEMPLATES,
        "response_counts": counts,
        "status_map": ZONE_STATUS,
        "silence_escalations": SILENCE_ESCALATIONS,
        "feed": _feed(state),
        "analytics": _analytics(counts),
        "trust": {
            "population_reached": reached,
            "board_visibility": "live",
            "public_risk_lowered": "34%",
            "communication_confidence": 93,
            "accountability_score": 96,
        },
        "ledger": state["sent_messages"],
        "summary": {
            "active_broadcasts": 4,
            "population_reached": reached,
            "acknowledged": counts["acknowledged"],
            "need_help": counts["need_help"],
            "trapped": counts["trapped"],
            "silent": counts["silent"],
            "delivery_success_percent": 97,
        },
    }


def send_communication(template_id: str, audience_id: str, channels: list[str] | None = None) -> dict[str, Any]:
    selected_channels = channels or ["in_app", "sms", "voice", "webhook"]
    ops_communications_store.send_message(template_id, audience_id, selected_channels)
    return build_communications_snapshot()


def record_response(person_id: str, response: str) -> dict[str, Any]:
    ops_communications_store.record_response(person_id, response)
    return build_communications_snapshot()


def get_feed() -> dict[str, Any]:
    snapshot = build_communications_snapshot()
    return {"generated_at": snapshot["generated_at"], "feed": snapshot["feed"]}


def get_metrics() -> dict[str, Any]:
    snapshot = build_communications_snapshot()
    return {
        "generated_at": snapshot["generated_at"],
        "summary": snapshot["summary"],
        "analytics": snapshot["analytics"],
        "channels": snapshot["channels"],
        "response_counts": snapshot["response_counts"],
    }


def get_escalations() -> dict[str, Any]:
    snapshot = build_communications_snapshot()
    return {"generated_at": snapshot["generated_at"], "silence_escalations": snapshot["silence_escalations"]}


def get_templates() -> dict[str, Any]:
    snapshot = build_communications_snapshot()
    return {"generated_at": snapshot["generated_at"], "templates": snapshot["templates"]}
