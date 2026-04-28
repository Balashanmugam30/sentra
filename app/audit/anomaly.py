from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any


def _parse_timestamp(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def detect_audit_anomalies(events: list[dict[str, Any]]) -> list[dict[str, Any]]:
    anomalies: list[dict[str, Any]] = []
    if not events:
        return anomalies

    recent = sorted(events, key=lambda item: item["timestamp_utc"])
    now = _parse_timestamp(recent[-1]["timestamp_utc"])

    failed_logins_by_source: dict[str, list[dict[str, Any]]] = defaultdict(list)
    denied_by_actor: dict[str, list[dict[str, Any]]] = defaultdict(list)
    login_ips_by_actor: dict[str, list[dict[str, Any]]] = defaultdict(list)
    lockdowns: list[dict[str, Any]] = []
    role_changes: list[dict[str, Any]] = []
    hardware_commands: list[dict[str, Any]] = []

    for event in recent:
        if event["category"] == "auth" and event["action"] == "login_failed":
            key = event.get("source_ip") or event.get("actor_email") or "unknown"
            failed_logins_by_source[key].append(event)
        if event["status"] == "denied":
            key = event.get("actor_email") or event.get("source_ip") or "unknown"
            denied_by_actor[key].append(event)
        if event["category"] == "auth" and event["action"] == "login_success" and event.get("actor_email"):
            login_ips_by_actor[str(event["actor_email"])].append(event)
        if event["category"] == "facility" and event["action"] == "lockdown":
            lockdowns.append(event)
        if event["category"] == "rbac" and event["action"] == "role_assignment":
            role_changes.append(event)
        if event["category"] == "hardware" and event["action"] == "device_command":
            hardware_commands.append(event)

    ten_minutes_ago = now - timedelta(minutes=10)
    fifteen_minutes_ago = now - timedelta(minutes=15)
    thirty_minutes_ago = now - timedelta(minutes=30)

    for source, attempts in failed_logins_by_source.items():
        recent_attempts = [event for event in attempts if _parse_timestamp(event["timestamp_utc"]) >= ten_minutes_ago]
        if len(recent_attempts) >= 5:
            anomalies.append(
                {
                    "anomaly_id": f"ANOM-{source}-failed-logins",
                    "title": "Brute force suspected",
                    "severity": "high",
                    "description": f"{len(recent_attempts)} failed logins detected from {source} within 10 minutes.",
                    "related_event_ids": [event["event_id"] for event in recent_attempts],
                }
            )

    for actor, attempts in login_ips_by_actor.items():
        recent_attempts = [event for event in attempts if _parse_timestamp(event["timestamp_utc"]) >= ten_minutes_ago]
        distinct_ips = {event.get("source_ip") for event in recent_attempts if event.get("source_ip")}
        if len(distinct_ips) >= 2:
            anomalies.append(
                {
                    "anomaly_id": f"ANOM-{actor}-multi-ip",
                    "title": "Rapid multi-IP access",
                    "severity": "medium",
                    "description": f"{actor} authenticated from {len(distinct_ips)} IPs in a short window.",
                    "related_event_ids": [event["event_id"] for event in recent_attempts],
                }
            )

    for actor, attempts in denied_by_actor.items():
        recent_attempts = [event for event in attempts if _parse_timestamp(event["timestamp_utc"]) >= ten_minutes_ago]
        if len(recent_attempts) >= 4:
            anomalies.append(
                {
                    "anomaly_id": f"ANOM-{actor}-denied-burst",
                    "title": "Repeated denied requests",
                    "severity": "medium",
                    "description": f"{actor} triggered {len(recent_attempts)} denied requests in 10 minutes.",
                    "related_event_ids": [event["event_id"] for event in recent_attempts],
                }
            )

        if any(event.get("actor_role") == "responder" for event in recent_attempts):
            anomalies.append(
                {
                    "anomaly_id": f"ANOM-{actor}-responder-admin-route",
                    "title": "Responder attempted privileged route",
                    "severity": "high",
                    "description": f"{actor} attempted privileged access outside responder scope.",
                    "related_event_ids": [event["event_id"] for event in recent_attempts],
                }
            )

    recent_lockdowns = [event for event in lockdowns if _parse_timestamp(event["timestamp_utc"]) >= fifteen_minutes_ago]
    if len(recent_lockdowns) >= 3:
        anomalies.append(
            {
                "anomaly_id": "ANOM-lockdown-spike",
                "title": "Excessive lockdown commands",
                "severity": "critical",
                "description": f"{len(recent_lockdowns)} lockdown actions were issued within 15 minutes.",
                "related_event_ids": [event["event_id"] for event in recent_lockdowns],
            }
        )

    recent_role_changes = [event for event in role_changes if _parse_timestamp(event["timestamp_utc"]) >= thirty_minutes_ago]
    if len(recent_role_changes) >= 3:
        anomalies.append(
            {
                "anomaly_id": "ANOM-role-change-burst",
                "title": "Mass role changes",
                "severity": "high",
                "description": f"{len(recent_role_changes)} role assignments were recorded within 30 minutes.",
                "related_event_ids": [event["event_id"] for event in recent_role_changes],
            }
        )

    recent_hardware_commands = [event for event in hardware_commands if _parse_timestamp(event["timestamp_utc"]) >= ten_minutes_ago]
    if len(recent_hardware_commands) >= 5:
        anomalies.append(
            {
                "anomaly_id": "ANOM-hardware-command-burst",
                "title": "Hardware command burst",
                "severity": "high",
                "description": f"{len(recent_hardware_commands)} hardware commands were issued in 10 minutes.",
                "related_event_ids": [event["event_id"] for event in recent_hardware_commands],
            }
        )

    night_admin_events = [
        event
        for event in recent
        if event.get("actor_role") == "super_admin"
        and _parse_timestamp(event["timestamp_utc"]).astimezone(timezone.utc).hour < 5
    ]
    if night_admin_events:
        anomalies.append(
            {
                "anomaly_id": "ANOM-night-admin-activity",
                "title": "Unusual admin activity",
                "severity": "low",
                "description": "Privileged admin activity was recorded during low-traffic night hours.",
                "related_event_ids": [event["event_id"] for event in night_admin_events[-5:]],
            }
        )

    return anomalies[:8]
