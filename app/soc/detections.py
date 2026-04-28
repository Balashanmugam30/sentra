from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta
from typing import Any

from app.audit.anomaly import detect_audit_anomalies
from app.audit.engine import get_all_audit_events
from app.soc.telemetry import TelemetryRecord, get_recent_telemetry


def _parse_timestamp(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _now_from_sources(events: list[dict[str, Any]], telemetry: list[TelemetryRecord]) -> datetime:
    timestamps: list[datetime] = []
    timestamps.extend(_parse_timestamp(event["timestamp_utc"]) for event in events if event.get("timestamp_utc"))
    timestamps.extend(record.timestamp for record in telemetry)
    return max(timestamps) if timestamps else datetime.now().astimezone()


def _build_detection(
    *,
    detection_id: str,
    title: str,
    severity: str,
    source_rule: str,
    description: str,
    related_events: list[str] | None = None,
    affected_user: str | None = None,
    affected_module: str | None = None,
) -> dict[str, Any]:
    return {
        "detection_id": detection_id,
        "title": title,
        "severity": severity,
        "source_rule": source_rule,
        "description": description,
        "related_event_ids": related_events or [],
        "affected_user": affected_user,
        "affected_module": affected_module,
    }


def compute_soc_detections() -> list[dict[str, Any]]:
    events = get_all_audit_events()
    telemetry = get_recent_telemetry()
    now = _now_from_sources(events, telemetry)

    ten_minutes_ago = now - timedelta(minutes=10)
    fifteen_minutes_ago = now - timedelta(minutes=15)
    one_hour_ago = now - timedelta(hours=1)

    detections: list[dict[str, Any]] = []

    for anomaly in detect_audit_anomalies(events):
        detections.append(
            _build_detection(
                detection_id=f"SOC-{anomaly['anomaly_id']}",
                title=anomaly["title"],
                severity=anomaly["severity"],
                source_rule=f"audit::{anomaly['anomaly_id']}",
                description=anomaly["description"],
                related_events=list(anomaly.get("related_event_ids", [])),
            )
        )

    refresh_by_actor: dict[str, list[dict[str, Any]]] = defaultdict(list)
    login_logout_by_actor: dict[str, list[dict[str, Any]]] = defaultdict(list)
    export_by_actor: dict[str, list[dict[str, Any]]] = defaultdict(list)
    facility_burst: list[dict[str, Any]] = []
    role_changes: list[dict[str, Any]] = []

    for event in events:
        event_ts = _parse_timestamp(event["timestamp_utc"])
        if event_ts < one_hour_ago:
            continue
        actor = str(event.get("actor_email") or "unknown")
        if event["category"] == "auth" and event["action"] == "refresh_token" and event_ts >= ten_minutes_ago:
            refresh_by_actor[actor].append(event)
        if event["category"] == "auth" and event["action"] in {"login_success", "logout"} and event_ts >= ten_minutes_ago:
            login_logout_by_actor[actor].append(event)
        if event.get("target_module") == "/audit/export" or event["action"] in {"export", "delivery_test"}:
            export_by_actor[actor].append(event)
        if event["category"] == "facility" and event["action"] in {"lockdown", "door_command", "hvac_command"} and event_ts >= fifteen_minutes_ago:
            facility_burst.append(event)
        if event["category"] == "rbac" and event["action"] == "role_assignment" and event_ts >= fifteen_minutes_ago:
            role_changes.append(event)

    for actor, actor_events in refresh_by_actor.items():
        if len(actor_events) >= 6:
            detections.append(
                _build_detection(
                    detection_id=f"SOC-REFRESH-{actor}",
                    title="Token refresh storm",
                    severity="high",
                    source_rule="auth_refresh_storm",
                    description=f"{actor} refreshed tokens {len(actor_events)} times in 10 minutes.",
                    related_events=[event["event_id"] for event in actor_events],
                    affected_user=actor,
                    affected_module="auth",
                )
            )

    for actor, actor_events in login_logout_by_actor.items():
        if len(actor_events) >= 6:
            detections.append(
                _build_detection(
                    detection_id=f"SOC-CYCLE-{actor}",
                    title="Rapid login/logout cycling",
                    severity="medium",
                    source_rule="auth_cycle_anomaly",
                    description=f"{actor} cycled login and logout activity unusually fast.",
                    related_events=[event["event_id"] for event in actor_events],
                    affected_user=actor,
                    affected_module="auth",
                )
            )

    session_map: dict[str, set[str]] = defaultdict(set)
    for record in telemetry:
        if record.session_id and record.timestamp >= ten_minutes_ago and record.source_ip:
            session_map[record.session_id].add(record.source_ip)
    for session_id, ips in session_map.items():
        if len(ips) >= 2:
            detections.append(
                _build_detection(
                    detection_id=f"SOC-SESSION-{session_id}",
                    title="Session reuse anomaly",
                    severity="high",
                    source_rule="session_reuse_anomaly",
                    description=f"Session {session_id} was observed from {len(ips)} IPs.",
                    affected_module="auth",
                )
            )

    forbidden_by_actor: dict[str, list[TelemetryRecord]] = defaultdict(list)
    for record in telemetry:
        if record.timestamp >= ten_minutes_ago and record.status_code == 403:
            forbidden_by_actor[str(record.actor_email or record.source_ip or "unknown")].append(record)
    for actor, actor_records in forbidden_by_actor.items():
        if len(actor_records) >= 4:
            detections.append(
                _build_detection(
                    detection_id=f"SOC-FORBIDDEN-{actor}",
                    title="Repeated forbidden access attempts",
                    severity="high",
                    source_rule="rbac_forbidden_burst",
                    description=f"{actor} triggered {len(actor_records)} forbidden responses in 10 minutes.",
                    affected_user=actor,
                    affected_module=actor_records[-1].module,
                )
            )

    if len(role_changes) >= 3:
        detections.append(
            _build_detection(
                detection_id="SOC-MASS-ROLE-CHANGES",
                title="Mass role assignment attempts",
                severity="critical",
                source_rule="rbac_mass_role_changes",
                description=f"{len(role_changes)} role assignments were attempted in 15 minutes.",
                related_events=[event["event_id"] for event in role_changes],
                affected_module="rbac",
            )
        )

    recent_telemetry = [record for record in telemetry if record.timestamp >= ten_minutes_ago]
    error_records = [record for record in recent_telemetry if record.status_code >= 500]
    if len(error_records) >= 5:
        detections.append(
            _build_detection(
                detection_id="SOC-API-ERROR-SPIKE",
                title="API error spike",
                severity="high",
                source_rule="system_api_error_spike",
                description=f"{len(error_records)} API errors were observed in the last 10 minutes.",
                affected_module=error_records[-1].module,
            )
        )

    latency_groups: dict[str, list[TelemetryRecord]] = defaultdict(list)
    for record in recent_telemetry:
        latency_groups[record.module].append(record)
    for module, module_records in latency_groups.items():
        slow = [record.duration_ms for record in module_records]
        if slow and sorted(slow)[int((len(slow) - 1) * 0.95)] >= 1200:
            detections.append(
                _build_detection(
                    detection_id=f"SOC-LATENCY-{module}",
                    title="Route latency spike",
                    severity="high" if module != "analytics" else "medium",
                    source_rule="system_latency_spike",
                    description=f"{module} latency exceeded the SOC threshold.",
                    affected_module=module,
                )
            )

    for actor, actor_events in export_by_actor.items():
        if len(actor_events) >= 4:
            detections.append(
                _build_detection(
                    detection_id=f"SOC-EXPORT-{actor}",
                    title="Repeated export or download requests",
                    severity="medium",
                    source_rule="system_export_burst",
                    description=f"{actor} issued repeated export-style requests.",
                    related_events=[event["event_id"] for event in actor_events],
                    affected_user=actor,
                )
            )

    if len(facility_burst) >= 4:
        detections.append(
            _build_detection(
                detection_id="SOC-FACILITY-BURST",
                title="Suspicious facility command burst",
                severity="critical",
                source_rule="facility_command_burst",
                description=f"{len(facility_burst)} high-impact facility commands were executed rapidly.",
                related_events=[event["event_id"] for event in facility_burst],
                affected_module="facility",
            )
        )

    hardware_records = [record for record in recent_telemetry if record.module == "hardware" and record.method == "POST"]
    if len(hardware_records) >= 5:
        detections.append(
            _build_detection(
                detection_id="SOC-HARDWARE-FLOOD",
                title="Hardware command flood",
                severity="high",
                source_rule="hardware_command_flood",
                description=f"{len(hardware_records)} hardware write requests were detected in 10 minutes.",
                affected_module="hardware",
            )
        )

    unusual_exec = [
        record
        for record in recent_telemetry
        if record.actor_role == "executive" and record.module not in {"analytics", "governance", "audit", "soc"}
    ]
    if unusual_exec:
        detections.append(
            _build_detection(
                detection_id="SOC-EXEC-UNUSUAL-MODULE",
                title="Executive user accessing unusual modules",
                severity="medium",
                source_rule="insider_exec_unusual_modules",
                description="Executive activity was observed outside the normal executive module set.",
                affected_user=unusual_exec[-1].actor_email,
                affected_module=unusual_exec[-1].module,
            )
        )

    admin_night = [
        event
        for event in events
        if event.get("actor_role") == "super_admin"
        and _parse_timestamp(event["timestamp_utc"]).hour < 5
        and _parse_timestamp(event["timestamp_utc"]) >= one_hour_ago
    ]
    if admin_night:
        detections.append(
            _build_detection(
                detection_id="SOC-ADMIN-NIGHT",
                title="Super admin activity outside normal hours",
                severity="medium",
                source_rule="insider_admin_after_hours",
                description="Privileged after-hours activity was observed within the last hour.",
                related_events=[event["event_id"] for event in admin_night[-5:]],
                affected_module="system",
            )
        )

    return detections[:12]
