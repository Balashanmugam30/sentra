from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import uuid4

from app.audit.engine import append_audit_event
from app.core.config import settings
from app.iot.schemas import IotAlertRequest, IotProvisionRequest, IotRoiRequest, IotTelemetryRequest, RiskLevel
from app.iot.store import DEFAULT_THRESHOLDS, SEEDED_NODES, iot_store
from app.schemas.incident_schema import IncidentCreate
from app.services.incident_service import create_incident


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _serialize_dt(value: datetime | None) -> str | None:
    return value.isoformat() if value else None


def _risk_from_payload(payload: IotTelemetryRequest) -> tuple[RiskLevel, int, list[str]]:
    thresholds = {**DEFAULT_THRESHOLDS, **iot_store.get_thresholds()}
    gas_warning = int(thresholds["gas_warning_threshold"])
    gas_danger = int(thresholds["gas_danger_threshold"])
    temp_warning = float(thresholds["temp_warning_threshold"])
    temp_danger = float(thresholds["temp_critical_threshold"])
    triggers: list[str] = []
    score = 8

    if payload.temperature is not None:
        if payload.temperature >= temp_danger:
            triggers.append("temperature_danger")
            score += 48
        elif payload.temperature >= temp_warning:
            triggers.append("temperature_rising")
            score += 24

    if payload.gas_level is not None:
        if payload.gas_level >= gas_danger:
            triggers.append("gas_danger")
            score += 58
        elif payload.gas_level >= gas_warning:
            triggers.append("gas_elevated")
            score += 28

    if payload.flame_detected:
        triggers.append("flame_detected")
        score += 72

    if payload.button_pressed:
        triggers.append("manual_panic_button")
        score += 68

    score = max(0, min(100, score))
    critical_triggers = {"flame_detected", "gas_danger", "manual_panic_button", "temperature_danger"}
    critical_count = len([trigger for trigger in triggers if trigger in critical_triggers])

    if critical_count >= 2:
        return "CRITICAL+", score, triggers
    if critical_count == 1:
        return "CRITICAL", score, triggers
    if triggers:
        return "WARNING", max(score, 42), triggers
    return "SAFE", min(score, 18), triggers


def _node_status_for_risk(risk_level: RiskLevel) -> str:
    if risk_level in {"CRITICAL", "CRITICAL+"}:
        return "critical"
    if risk_level == "WARNING":
        return "warning"
    return "online"


def _health_score(node: dict[str, Any]) -> int:
    score = 100
    rssi = node.get("wifi_rssi")
    battery = node.get("battery")
    packet_success = float(node.get("packet_success_rate") or 98)
    uptime = float(node.get("uptime_percent") or 98)

    if node.get("disabled"):
        return 0
    if node.get("status") == "offline":
        score -= 38
    if isinstance(rssi, int):
        if rssi < -82:
            score -= 24
        elif rssi < -72:
            score -= 14
        elif rssi < -64:
            score -= 7
    if isinstance(battery, (int, float)) and battery < 25:
        score -= 18
    if node.get("risk_level") == "WARNING":
        score -= 8
    if node.get("risk_level") in {"CRITICAL", "CRITICAL+"}:
        score -= 28
    score -= max(0, int((100 - packet_success) * 0.9))
    score -= max(0, int((100 - uptime) * 0.55))
    score -= min(16, int(node.get("false_alarm_count") or 0) * 3)
    return max(0, min(100, score))


def _default_node(node_id: str) -> dict[str, Any]:
    for node in SEEDED_NODES:
        if node["node_id"] == node_id:
            return dict(node)
    return {
        "node_id": node_id,
        "node_type": "utility_risk_node",
        "label": node_id.replace("_", " ").title(),
        "building": "Grand Meridian Hotel",
        "zone": "Unassigned Utility Zone",
        "install_location": "Field installed node",
        "status": "awaiting_telemetry",
        "last_heartbeat": None,
        "wifi_rssi": None,
        "battery": None,
        "risk_level": "SAFE",
        "risk_score": 0,
        "latest_telemetry": None,
        "floor": "Unassigned",
        "firmware_version": "field-unknown",
        "assigned_role": "monitoring",
        "health_score": 72,
        "latency_ms": 0,
        "packet_success_rate": 98.0,
        "uptime_percent": 98.0,
        "false_alarm_count": 0,
        "muted": False,
        "disabled": False,
    }


async def _create_iot_incident(event: dict[str, Any], node: dict[str, Any]) -> str:
    incident = await create_incident(
        IncidentCreate(
            trace_id=event["event_id"],
            type="IoT Edge Critical Alert",
            severity=5 if event["risk_level"] == "CRITICAL+" else 4,
            location=f"{node['building']} - {node['zone']} - {node['install_location']}",
            risk_level=str(event["risk_level"]),
            incident_type="iot_edge_sensor",
            confidence=min(0.99, 0.72 + int(event["risk_score"]) / 400),
            detected_by=str(node["node_id"]),
            recommended_action="Dispatch responder, verify utility isolation, request corridor camera snapshot.",
            priority="critical" if event["risk_level"] == "CRITICAL+" else "high",
            decision_confidence=0.91,
            decided_by="Sentra IoT Risk Engine",
        )
    )
    return incident.id


async def ingest_telemetry(payload: IotTelemetryRequest) -> dict[str, Any]:
    timestamp = payload.timestamp or utc_now()
    risk_level, risk_score, triggers = _risk_from_payload(payload)
    event = {
        "event_id": f"IOT-{uuid4().hex[:10].upper()}",
        "node_id": payload.node_id,
        "timestamp": _serialize_dt(timestamp),
        "temperature": payload.temperature,
        "humidity": payload.humidity,
        "gas_level": payload.gas_level,
        "flame_detected": payload.flame_detected,
        "button_pressed": payload.button_pressed,
        "wifi_rssi": payload.wifi_rssi,
        "battery": payload.battery,
        "risk_level": risk_level,
        "risk_score": risk_score,
        "triggers": triggers,
        "action_status": "recorded",
        "incident_id": None,
    }

    node = _default_node(payload.node_id)
    node.update(
        {
            "status": _node_status_for_risk(risk_level),
            "last_heartbeat": _serialize_dt(timestamp),
            "wifi_rssi": payload.wifi_rssi,
            "battery": payload.battery,
            "risk_level": risk_level,
            "risk_score": risk_score,
            "latency_ms": max(42, min(900, 180 + (abs(payload.wifi_rssi or -62) - 55) * 4)),
            "packet_success_rate": 97.9 if risk_level == "SAFE" else 95.6,
            "latest_telemetry": dict(event),
        }
    )

    if payload.camera_snapshot_url:
        iot_store.update_camera(
            node_id=payload.node_id,
            snapshot_url=str(payload.camera_snapshot_url),
            last_capture_at=_serialize_dt(timestamp),
        )

    if risk_level in {"CRITICAL", "CRITICAL+"}:
        incident_id = await _create_iot_incident(event, node)
        event["incident_id"] = incident_id
        event["action_status"] = "incident_created_mobile_notified_camera_requested"
        node["latest_telemetry"] = dict(event)
        append_audit_event(
            category="iot",
            action="critical_telemetry_ingested",
            severity="critical",
            target_module="iot",
            target_id=payload.node_id,
            status="success",
            reason=f"{risk_level} hardware telemetry triggered incident {incident_id}",
            risk_score=risk_score,
        )

    node["health_score"] = _health_score(node)
    stored_node = iot_store.upsert_node(node)
    iot_store.append_event(event)
    return {
        "accepted": True,
        "node": stored_node,
        "event": event,
        "buzzer_command": "on" if risk_level in {"CRITICAL", "CRITICAL+"} else "pulse" if risk_level == "WARNING" else "off",
        "camera_snapshot_requested": risk_level in {"CRITICAL", "CRITICAL+"},
    }


async def ingest_alert(payload: IotAlertRequest) -> dict[str, Any]:
    timestamp = payload.timestamp or utc_now()
    node = _default_node(payload.node_id)
    risk_level = payload.risk_level or ("CRITICAL" if "panic" in payload.alert_type.lower() else "WARNING")
    risk_score = 92 if risk_level == "CRITICAL+" else 84 if risk_level == "CRITICAL" else 54
    alert = {
        "event_id": f"IAL-{uuid4().hex[:10].upper()}",
        "node_id": payload.node_id,
        "timestamp": _serialize_dt(timestamp),
        "alert_type": payload.alert_type,
        "message": payload.message,
        "risk_level": risk_level,
        "risk_score": risk_score,
        "incident_id": None,
    }
    if risk_level in {"CRITICAL", "CRITICAL+"}:
        event_like = {
            "event_id": alert["event_id"],
            "risk_level": risk_level,
            "risk_score": risk_score,
        }
        alert["incident_id"] = await _create_iot_incident(event_like, node)
    node.update(
        {
            "status": _node_status_for_risk(risk_level),
            "last_heartbeat": _serialize_dt(timestamp),
            "risk_level": risk_level,
            "risk_score": risk_score,
        }
    )
    stored_node = iot_store.upsert_node(node)
    iot_store.append_alert(alert)
    return {"accepted": True, "alert": alert, "node": stored_node}


def list_nodes() -> list[dict[str, Any]]:
    return iot_store.list_nodes()


def list_events() -> list[dict[str, Any]]:
    return sorted(iot_store.list_events(), key=lambda item: str(item["timestamp"]), reverse=True)[:100]


def _events_for_node(node_id: str) -> list[dict[str, Any]]:
    return [event for event in list_events() if event.get("node_id") == node_id][:20]


def fleet_summary() -> dict[str, Any]:
    nodes = list_nodes()
    events = list_events()
    active_nodes = len([node for node in nodes if node["status"] in {"online", "warning", "critical"} and not node.get("disabled")])
    offline_nodes = len([node for node in nodes if node["status"] in {"offline", "disabled", "awaiting_telemetry"} or node.get("disabled")])
    critical_alerts = len([event for event in events if event.get("risk_level") in {"CRITICAL", "CRITICAL+"}])
    health_scores = [int(node.get("health_score") or _health_score(node)) for node in nodes]
    latency_values = [int(node.get("latency_ms") or 0) for node in nodes if int(node.get("latency_ms") or 0) > 0]
    camera_nodes_online = len(
        [
            node
            for node in nodes
            if node["node_type"] == "corridor_camera" and node["status"] in {"online", "warning", "critical"}
        ]
    )
    settings = iot_store.get_settings()
    return {
        "active_nodes": active_nodes,
        "offline_nodes": offline_nodes,
        "critical_alerts": critical_alerts,
        "avg_health_score": round(sum(health_scores) / max(1, len(health_scores))),
        "avg_latency_ms": round(sum(latency_values) / max(1, len(latency_values))) if latency_values else 0,
        "total_events_today": len(events),
        "camera_nodes_online": camera_nodes_online,
        "mode": str(settings.get("mode") or "HYBRID"),
    }


def get_fleet() -> dict[str, Any]:
    return {
        "generated_at": utc_now(),
        "summary": fleet_summary(),
        "nodes": list_nodes(),
    }


def get_node_detail(node_id: str) -> dict[str, Any]:
    node = iot_store.get_node(node_id)
    if not node:
        raise KeyError(node_id)
    recent_events = _events_for_node(node_id)
    diagnostics = {
        "packet_success_rate": node.get("packet_success_rate", 98.0),
        "uptime_percent": node.get("uptime_percent", 98.0),
        "heartbeat_age_seconds": 28 if node.get("last_heartbeat") else None,
        "signal_quality": "strong" if int(node.get("wifi_rssi") or -90) > -65 else "watch",
        "tamper_risk": "low" if node.get("status") != "offline" else "medium",
        "recommended_action": "Monitor" if int(node.get("health_score") or 0) >= 75 else "Inspect node placement and Wi-Fi path",
    }
    return {
        "generated_at": utc_now(),
        "node": node,
        "recent_events": recent_events,
        "diagnostics": diagnostics,
        "calibration": iot_store.get_calibration(node_id),
    }


def _record_node_command(node_id: str, action: str, message: str, node: dict[str, Any]) -> dict[str, Any]:
    command = {
        "event_id": f"CMD-{uuid4().hex[:10].upper()}",
        "node_id": node_id,
        "timestamp": _serialize_dt(utc_now()),
        "action": action,
        "message": message,
        "result": "accepted",
    }
    iot_store.append_command(command)
    append_audit_event(
        category="iot",
        action=f"node_{action}",
        severity="info",
        target_module="iot",
        target_id=node_id,
        status="success",
        reason=message,
        risk_score=int(node.get("risk_score") or 0),
    )
    return {"accepted": True, "node_id": node_id, "action": action, "message": message, "node": node}


def run_node_action(node_id: str, action: str, label: str | None = None) -> dict[str, Any]:
    node = iot_store.get_node(node_id)
    if not node:
        raise KeyError(node_id)

    updates: dict[str, Any] = {}
    message = f"{action.replace('_', ' ').title()} accepted for {node_id}"
    if action == "restart":
        updates = {"status": "online", "last_heartbeat": _serialize_dt(utc_now()), "latency_ms": 146}
        message = "Restart command queued and node heartbeat refreshed"
    elif action == "mute":
        updates = {"muted": True}
        message = "Buzzer muted until the next critical incident"
    elif action == "snapshot":
        iot_store.update_camera(node_id=node_id, last_capture_at=_serialize_dt(utc_now()))
        alert = {
            "event_id": f"IAL-{uuid4().hex[:10].upper()}",
            "node_id": node_id,
            "timestamp": _serialize_dt(utc_now()),
            "alert_type": "camera_snapshot",
            "message": f"Camera snapshot requested from {node.get('label', node_id)}",
            "risk_level": "WARNING",
            "risk_score": 48,
            "incident_id": None,
        }
        iot_store.append_alert(alert)
        message = "Public-area camera snapshot requested"
    elif action == "ping":
        updates = {"last_heartbeat": _serialize_dt(utc_now()), "status": "online", "latency_ms": 118}
        message = "Ping successful and node responded"
    elif action == "disable":
        updates = {"disabled": True, "status": "disabled", "health_score": 0}
        message = "Node disabled and excluded from active automation"
    elif action == "rename":
        if not label:
            raise ValueError("label is required for rename")
        updates = {"label": label}
        message = f"Node renamed to {label}"
    else:
        raise ValueError(f"Unsupported node action: {action}")

    updated = iot_store.update_node(node_id, updates) if updates else node
    if action != "disable":
        updated["health_score"] = _health_score(updated)
        updated = iot_store.update_node(node_id, {"health_score": updated["health_score"]})
    return _record_node_command(node_id, action, message, updated)


def calibrate_node(node_id: str, calibration: dict[str, Any]) -> dict[str, Any]:
    if not iot_store.get_node(node_id):
        raise KeyError(node_id)
    saved = iot_store.set_calibration(node_id, calibration)
    iot_store.set_thresholds(saved)
    node = iot_store.update_node(node_id, {"health_score": max(70, int(iot_store.get_node(node_id).get("health_score") or 80))})
    append_audit_event(
        category="iot",
        action="node_calibrated",
        severity="info",
        target_module="iot",
        target_id=node_id,
        status="success",
        reason=f"Calibration preset {saved.get('preset')} applied",
        risk_score=int(node.get("risk_score") or 0),
    )
    return {"accepted": True, "node_id": node_id, "action": "calibrate", "message": "Calibration profile saved", "node": node}


def get_thresholds() -> dict[str, Any]:
    return {
        "generated_at": utc_now(),
        "thresholds": iot_store.get_thresholds(),
        "presets": ["Hotel", "Hospital", "School", "Mall", "Office Tower"],
    }


def set_thresholds(thresholds: dict[str, Any]) -> dict[str, Any]:
    saved = iot_store.set_thresholds(thresholds)
    return {
        "generated_at": utc_now(),
        "thresholds": saved,
        "presets": ["Hotel", "Hospital", "School", "Mall", "Office Tower"],
    }


def get_analytics(time_range: str = "24h") -> dict[str, Any]:
    events = list_events()
    nodes = list_nodes()
    now = utc_now()
    points = 24 if time_range in {"24h", "7d", "30d"} else 6
    gas_series: list[dict[str, object]] = []
    temp_series: list[dict[str, object]] = []
    incident_series: list[dict[str, object]] = []
    for index in range(points):
        stamp = now - timedelta(hours=points - index - 1)
        gas_series.append({"label": stamp.strftime("%H:%M"), "value": 620 + ((index * 137) % 940)})
        temp_series.append({"label": stamp.strftime("%H:%M"), "value": round(30 + ((index * 1.7) % 20), 1)})
        incident_series.append({"label": stamp.strftime("%H:%M"), "value": 1 if index in {5, 13, 19} else 0})
    offline_nodes = [node for node in nodes if node["status"] in {"offline", "disabled"}]
    metrics = {
        "hourly_incidents": sum(int(point["value"]) for point in incident_series),
        "gas_trend_peak": max(int(point["value"]) for point in gas_series),
        "temp_trend_peak": max(float(point["value"]) for point in temp_series),
        "busiest_zones": ["Kitchen Zone B", "Generator Room", "Floor 3 Corridor"],
        "false_alarms": sum(int(node.get("false_alarm_count") or 0) for node in nodes),
        "offline_durations_minutes": len(offline_nodes) * 18,
        "avg_response_time_seconds": 42,
        "camera_request_frequency": len([event for event in events if "snapshot" in str(event).lower()]),
    }
    return {
        "generated_at": now,
        "time_range": time_range if time_range in {"1h", "24h", "7d", "30d"} else "24h",
        "metrics": metrics,
        "series": {"gas": gas_series, "temperature": temp_series, "incidents": incident_series},
    }


def get_health() -> dict[str, Any]:
    nodes = list_nodes()
    diagnostics = [
        {
            "node_id": node["node_id"],
            "label": node["label"],
            "health_score": _health_score(node),
            "status": node["status"],
            "signal": node.get("wifi_rssi"),
            "latency_ms": node.get("latency_ms"),
            "recommendation": "Ready" if _health_score(node) >= 80 else "Inspect power, signal, and enclosure",
        }
        for node in nodes
    ]
    score = round(sum(int(item["health_score"]) for item in diagnostics) / max(1, len(diagnostics)))
    return {"generated_at": utc_now(), "fleet_health_score": score, "diagnostics": diagnostics}


def get_feed() -> dict[str, Any]:
    events = list_events()[:20]
    commands = sorted(iot_store.list_commands(), key=lambda item: str(item.get("timestamp")), reverse=True)[:10]
    feed: list[dict[str, object]] = []
    for event in events:
        feed.append(
            {
                "id": event.get("event_id"),
                "timestamp": event.get("timestamp"),
                "node_id": event.get("node_id"),
                "severity": event.get("risk_level", "SAFE"),
                "message": event.get("message")
                or f"{event.get('node_id')} telemetry scored {event.get('risk_level')} at {event.get('risk_score')}/100",
                "kind": "alert" if str(event.get("event_id", "")).startswith("IAL") else "telemetry",
            }
        )
    for command in commands:
        feed.append(
            {
                "id": command.get("event_id"),
                "timestamp": command.get("timestamp"),
                "node_id": command.get("node_id"),
                "severity": "SAFE",
                "message": command.get("message"),
                "kind": "command",
            }
        )
    return {
        "generated_at": utc_now(),
        "feed": sorted(feed, key=lambda item: str(item.get("timestamp")), reverse=True)[:25],
    }


def latest_camera() -> dict[str, Any]:
    camera = iot_store.get_camera()
    nodes = {node["node_id"]: node for node in iot_store.list_nodes()}
    node = nodes.get(str(camera.get("node_id") or "corridor_cam_01"), _default_node("corridor_cam_01"))
    return {
        "node_id": node["node_id"],
        "label": node["label"],
        "building": node["building"],
        "zone": node["zone"],
        "public_area_only": True,
        "snapshot_url": camera.get("snapshot_url") or settings.iot_camera_snapshot_url,
        "stream_url": camera.get("stream_url") or settings.iot_camera_stream_url,
        "last_capture_at": camera.get("last_capture_at"),
        "status": node["status"],
    }


def _node_type_from_provision(node_type: str) -> str:
    return {
        "sensor": "utility_risk_node",
        "camera": "corridor_camera",
        "hybrid": "hybrid_node",
    }.get(node_type, "utility_risk_node")


def get_provisioning() -> dict[str, Any]:
    nodes = list_nodes()
    return {
        "generated_at": utc_now(),
        "data": {
            "summary": {
                "registered_devices": len(nodes),
                "awaiting_install": len([node for node in nodes if node["status"] == "awaiting_telemetry"]),
                "secure_tokens_issued": len(nodes) + 12,
                "bulk_import_ready": True,
            },
            "devices": nodes,
            "bulk_template_columns": [
                "label",
                "building",
                "floor",
                "zone",
                "node_type",
                "tenant",
                "firmware_version",
            ],
        },
    }


def provision_device(payload: IotProvisionRequest) -> dict[str, Any]:
    node_id = f"{payload.node_type}_{uuid4().hex[:8]}"
    secure_token = f"sentra_{uuid4().hex}{uuid4().hex[:8]}"
    node = {
        "node_id": node_id,
        "node_type": _node_type_from_provision(payload.node_type),
        "label": payload.label,
        "building": payload.building,
        "zone": payload.zone,
        "install_location": f"Floor {payload.floor} - {payload.zone}",
        "status": "awaiting_telemetry",
        "last_heartbeat": None,
        "wifi_rssi": None,
        "battery": None,
        "risk_level": "SAFE",
        "risk_score": 0,
        "latest_telemetry": None,
        "floor": payload.floor,
        "firmware_version": payload.firmware_version,
        "assigned_role": f"{payload.node_type}_monitoring",
        "health_score": 72,
        "latency_ms": 0,
        "packet_success_rate": 99.0,
        "uptime_percent": 99.0,
        "false_alarm_count": 0,
        "muted": False,
        "disabled": False,
        "tenant": payload.tenant,
        "secure_token_preview": f"{secure_token[:12]}...",
    }
    stored = iot_store.upsert_node(node)
    qr_payload = f"sentra://provision?node_id={node_id}&tenant={payload.tenant}&token={secure_token}"
    append_audit_event(
        category="iot",
        action="device_provisioned",
        severity="info",
        target_module="iot",
        target_id=node_id,
        status="success",
        reason=f"{payload.node_type} node provisioned for {payload.building} / {payload.zone}",
        risk_score=0,
    )
    return {
        "generated_at": utc_now(),
        "device": stored,
        "qr_payload": qr_payload,
        "secure_token_preview": f"{secure_token[:12]}...",
    }


def get_firmware_center() -> dict[str, Any]:
    nodes = list_nodes()
    versions: dict[str, int] = {}
    for node in nodes:
        version = str(node.get("firmware_version") or "unknown")
        versions[version] = versions.get(version, 0) + 1
    return {
        "generated_at": utc_now(),
        "data": {
            "current_versions": versions,
            "available_releases": [
                {
                    "version": "edge-1.6.0",
                    "target": "esp32",
                    "notes": "Improved Wi-Fi reconnect, buffered telemetry, and MQ calibration smoothing.",
                    "compatible_devices": ["utility_risk_node", "hybrid_node"],
                    "status": "canary_ready",
                },
                {
                    "version": "cam-1.3.0",
                    "target": "esp32_cam",
                    "notes": "Lower memory MJPEG stream and snapshot timeout hardening.",
                    "compatible_devices": ["corridor_camera", "hybrid_node"],
                    "status": "stable",
                },
                {
                    "version": "hybrid-1.0.0",
                    "target": "hybrid",
                    "notes": "Unified sensor/camera node diagnostics and offline continuity queue.",
                    "compatible_devices": ["hybrid_node"],
                    "status": "preview",
                },
            ],
            "rollout": {
                "active_version": "edge-1.6.0",
                "rollout_percentage": 18,
                "canary_devices": ["utility_node_01", "laundry_node_01"],
                "paused": False,
                "rollback_available": "edge-1.5.0",
            },
            "failed_upgrades": [
                {"node_id": "stair_cam_02", "reason": "offline during rollout window", "retry_window": "Tonight 02:00"},
            ],
        },
    }


def release_firmware(version: str, rollout_percentage: int, target: str) -> dict[str, Any]:
    append_audit_event(
        category="iot",
        action="firmware_release_started",
        severity="info",
        target_module="iot",
        target_id=version,
        status="success",
        reason=f"{target} rollout started at {rollout_percentage}%",
        risk_score=12,
    )
    center = get_firmware_center()
    center["data"]["rollout"] = {
        "active_version": version,
        "rollout_percentage": rollout_percentage,
        "canary_devices": ["utility_node_01"],
        "paused": False,
        "rollback_available": "edge-1.5.0",
    }
    return center


def rollback_firmware() -> dict[str, Any]:
    append_audit_event(
        category="iot",
        action="firmware_rollback",
        severity="warning",
        target_module="iot",
        target_id="edge-rollback",
        status="success",
        reason="Rollback command accepted for current canary group",
        risk_score=28,
    )
    center = get_firmware_center()
    center["data"]["rollout"] = {
        "active_version": "edge-1.5.0",
        "rollout_percentage": 100,
        "canary_devices": [],
        "paused": True,
        "rollback_available": "edge-1.4.8",
    }
    return center


def get_network() -> dict[str, Any]:
    return {
        "generated_at": utc_now(),
        "data": {
            "summary": {
                "buildings_online": 4,
                "floors_monitored": 87,
                "devices_active": 416,
                "critical_incidents": 2,
                "avg_response_time_seconds": 41,
            },
            "buildings": [
                {"name": "Grand Meridian Hotel", "type": "hotel", "floors": 50, "rooms": 2000, "nodes": 150, "camera_zones": 18, "risk": "watch", "online": True},
                {"name": "Bala University", "type": "university", "floors": 24, "rooms": 780, "nodes": 96, "camera_zones": 22, "risk": "safe", "online": True},
                {"name": "Bala Hospital", "type": "hospital", "floors": 16, "rooms": 520, "nodes": 110, "camera_zones": 16, "risk": "critical", "online": True},
                {"name": "Metro Mall", "type": "mall", "floors": 7, "rooms": 240, "nodes": 60, "camera_zones": 12, "risk": "safe", "online": True},
            ],
        },
    }


def get_vision() -> dict[str, Any]:
    return {
        "generated_at": utc_now(),
        "data": {
            "privacy_rules": ["corridor_only", "lobby_only", "exit_only", "parking_only", "no_room_surveillance"],
            "camera_zones": [
                {"zone": "Floor 3 Corridor", "camera_id": "corridor_cam_01", "smoke_confidence": 12, "crowd_density": 38, "blocked_exit": False, "slip_fall": False, "queue_congestion": 24, "visibility": 91},
                {"zone": "South Stairwell", "camera_id": "stair_cam_02", "smoke_confidence": 8, "crowd_density": 14, "blocked_exit": True, "slip_fall": False, "queue_congestion": 31, "visibility": 74},
                {"zone": "Main Lobby", "camera_id": "hybrid_node_03", "smoke_confidence": 4, "crowd_density": 62, "blocked_exit": False, "slip_fall": False, "queue_congestion": 58, "visibility": 88},
                {"zone": "Parking Exit A", "camera_id": "parking_cam_01", "smoke_confidence": 2, "crowd_density": 21, "blocked_exit": False, "slip_fall": True, "queue_congestion": 17, "visibility": 84},
            ],
            "inference_pipeline": {
                "mode": "privacy_safe_public_zone",
                "face_recognition": False,
                "room_surveillance": False,
                "retention_hours": 24,
                "edge_blur_enabled": True,
            },
        },
    }


def get_demo_scenarios() -> dict[str, Any]:
    return {
        "generated_at": utc_now(),
        "data": {
            "scenarios": [
                {"id": "fire_kitchen", "title": "Fire in Kitchen Zone", "severity": "CRITICAL+", "building": "Grand Meridian Hotel", "expected_eta": "2m 10s"},
                {"id": "gas_basement", "title": "Gas Leak Basement", "severity": "CRITICAL", "building": "Grand Meridian Hotel", "expected_eta": "3m 20s"},
                {"id": "panic_floor_8", "title": "Panic in Floor 8", "severity": "WARNING", "building": "Grand Meridian Hotel", "expected_eta": "1m 45s"},
                {"id": "corridor_blockage", "title": "Corridor Blockage", "severity": "WARNING", "building": "Grand Meridian Hotel", "expected_eta": "1m 30s"},
                {"id": "power_failure", "title": "Power Failure", "severity": "CRITICAL", "building": "Metro Mall", "expected_eta": "4m 00s"},
                {"id": "hotel_fire_multi_floor", "title": "Multi-floor Hotel Fire", "severity": "CRITICAL+", "building": "Grand Meridian Hotel", "expected_eta": "5m 10s"},
                {"id": "hospital_oxygen_leak", "title": "Hospital Oxygen Leak", "severity": "CRITICAL+", "building": "Bala Hospital", "expected_eta": "2m 40s"},
            ]
        },
    }


def run_demo_scenario(scenario_id: str) -> dict[str, Any]:
    scenarios = {item["id"]: item for item in get_demo_scenarios()["data"]["scenarios"]}
    scenario = scenarios.get(scenario_id, scenarios["fire_kitchen"])
    alert = {
        "event_id": f"DEMO-{uuid4().hex[:10].upper()}",
        "node_id": "utility_node_01" if "hospital" not in scenario_id else "hybrid_node_03",
        "timestamp": _serialize_dt(utc_now()),
        "alert_type": scenario_id,
        "message": f"Judge demo launched: {scenario['title']}",
        "risk_level": scenario["severity"],
        "risk_score": 96 if scenario["severity"] == "CRITICAL+" else 84,
        "incident_id": None,
    }
    iot_store.append_alert(alert)
    append_audit_event(
        category="iot",
        action="judge_demo_scenario_run",
        severity="critical" if scenario["severity"] == "CRITICAL+" else "warning",
        target_module="iot",
        target_id=scenario_id,
        status="success",
        reason=f"{scenario['title']} scenario triggered routing, camera, and executive demo updates",
        risk_score=int(alert["risk_score"]),
    )
    return {
        "generated_at": utc_now(),
        "data": {
            "scenario": scenario,
            "alert": alert,
            "routing_update": "Safe route recalculated with camera verification requested",
            "executive_summary": f"{scenario['title']} validated Sentra's detect-alert-route-command loop in under {scenario['expected_eta']}.",
        },
    }


def calculate_roi(payload: IotRoiRequest) -> dict[str, Any]:
    prevented_losses = payload.incidents_per_year * payload.avg_loss_per_incident * 0.62
    response_savings = payload.incidents_per_year * payload.avg_loss_per_incident * 0.18
    insurance_reduction = payload.rooms * 38 + payload.floors * 1200
    staffing_efficiency = payload.staff_count * 900
    annual_value = prevented_losses + response_savings + insurance_reduction + staffing_efficiency
    estimated_cost = payload.rooms * 18 + payload.floors * 4200 + 48000
    roi_percent = round(((annual_value - estimated_cost) / max(1, estimated_cost)) * 100)
    payback_months = max(1, round((estimated_cost / max(1, annual_value)) * 12, 1))
    return {
        "generated_at": utc_now(),
        "data": {
            "inputs": payload.model_dump(),
            "prevented_losses": round(prevented_losses),
            "faster_response_savings": round(response_savings),
            "insurance_reduction_estimate": round(insurance_reduction),
            "staffing_efficiency": round(staffing_efficiency),
            "annual_value": round(annual_value),
            "estimated_year_one_cost": round(estimated_cost),
            "roi_percent": roi_percent,
            "payback_months": payback_months,
        },
    }


def get_roi_defaults() -> dict[str, Any]:
    return calculate_roi(IotRoiRequest(rooms=2000, floors=50, staff_count=420, incidents_per_year=34, avg_loss_per_incident=85000))


def get_launch() -> dict[str, Any]:
    return {
        "generated_at": utc_now(),
        "data": {
            "tam": "$42B smart safety + building intelligence",
            "sam": "$8.7B hotels, campuses, hospitals, malls, factories",
            "pricing": [
                {"tier": "Pilot", "price": "$2,500/mo/building", "best_for": "single flagship site"},
                {"tier": "Enterprise", "price": "$9,500/mo/campus", "best_for": "multi-building operations"},
                {"tier": "Government", "price": "custom", "best_for": "critical infrastructure and public safety"},
            ],
            "arr_forecast": [
                {"year": "Y1", "arr": 850000},
                {"year": "Y2", "arr": 4200000},
                {"year": "Y3", "arr": 12600000},
                {"year": "Y4", "arr": 31000000},
            ],
            "moats": [
                "Hardware-light deployment using existing alarms plus selective edge nodes",
                "Privacy-safe corridor vision instead of room surveillance",
                "Cross-building incident intelligence data moat",
                "AI route, response, and executive-command orchestration",
            ],
            "roadmap": ["15.C enterprise rollout", "15.D partner installer kits", "17 procurement pilots", "18 insurance integrations"],
        },
    }
