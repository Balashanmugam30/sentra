from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from threading import Lock
from typing import Any

from app.core.config import settings


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _iso(value: datetime) -> str:
    return value.isoformat()


NODE_DEFAULTS: dict[str, Any] = {
    "floor": "Unassigned",
    "firmware_version": "unknown",
    "assigned_role": "monitoring",
    "health_score": 72,
    "latency_ms": 0,
    "packet_success_rate": 99.0,
    "uptime_percent": 99.0,
    "false_alarm_count": 0,
    "muted": False,
    "disabled": False,
}


SEEDED_NODES: list[dict[str, Any]] = [
    {
        "node_id": "utility_node_01",
        "node_type": "utility_risk_node",
        "label": "Utility Risk Node A",
        "building": "Grand Meridian Hotel",
        "zone": "Kitchen Zone B",
        "install_location": "Kitchen gas utility wall",
        "status": "online",
        "last_heartbeat": None,
        "wifi_rssi": -57,
        "battery": None,
        "risk_level": "SAFE",
        "risk_score": 18,
        "latest_telemetry": None,
        "floor": "3",
        "firmware_version": "edge-1.5.0",
        "assigned_role": "gas_fire_monitoring",
        "health_score": 94,
        "latency_ms": 118,
        "packet_success_rate": 99.2,
        "uptime_percent": 99.6,
        "false_alarm_count": 1,
        "muted": False,
        "disabled": False,
    },
    {
        "node_id": "corridor_cam_01",
        "node_type": "corridor_camera",
        "label": "Corridor Verification Camera B",
        "building": "Grand Meridian Hotel",
        "zone": "Floor 3 Corridor",
        "install_location": "Public corridor near stairwell entry",
        "status": "online",
        "last_heartbeat": None,
        "wifi_rssi": -63,
        "battery": None,
        "risk_level": "SAFE",
        "risk_score": 12,
        "latest_telemetry": None,
        "floor": "3",
        "firmware_version": "cam-1.2.4",
        "assigned_role": "public_area_verification",
        "health_score": 88,
        "latency_ms": 164,
        "packet_success_rate": 97.8,
        "uptime_percent": 98.9,
        "false_alarm_count": 0,
        "muted": False,
        "disabled": False,
    },
    {
        "node_id": "utility_node_02",
        "node_type": "utility_risk_node",
        "label": "Generator Room Node",
        "building": "Grand Meridian Hotel",
        "zone": "Generator Room",
        "install_location": "Basement generator bay",
        "status": "warning",
        "last_heartbeat": None,
        "wifi_rssi": -71,
        "battery": 82.0,
        "risk_level": "WARNING",
        "risk_score": 46,
        "latest_telemetry": None,
        "floor": "B1",
        "firmware_version": "edge-1.5.0",
        "assigned_role": "heat_gas_monitoring",
        "health_score": 79,
        "latency_ms": 236,
        "packet_success_rate": 95.4,
        "uptime_percent": 97.2,
        "false_alarm_count": 2,
        "muted": False,
        "disabled": False,
    },
    {
        "node_id": "laundry_node_01",
        "node_type": "utility_risk_node",
        "label": "Laundry Heat Node",
        "building": "Grand Meridian Hotel",
        "zone": "Laundry Utility",
        "install_location": "Laundry exhaust wall",
        "status": "online",
        "last_heartbeat": None,
        "wifi_rssi": -61,
        "battery": 91.0,
        "risk_level": "SAFE",
        "risk_score": 21,
        "latest_telemetry": None,
        "floor": "2",
        "firmware_version": "edge-1.4.8",
        "assigned_role": "thermal_monitoring",
        "health_score": 91,
        "latency_ms": 132,
        "packet_success_rate": 98.6,
        "uptime_percent": 99.1,
        "false_alarm_count": 0,
        "muted": False,
        "disabled": False,
    },
    {
        "node_id": "stair_cam_02",
        "node_type": "corridor_camera",
        "label": "Stairwell Entry Camera",
        "building": "Grand Meridian Hotel",
        "zone": "South Stairwell",
        "install_location": "Public stairwell entry",
        "status": "offline",
        "last_heartbeat": None,
        "wifi_rssi": -84,
        "battery": None,
        "risk_level": "SAFE",
        "risk_score": 10,
        "latest_telemetry": None,
        "floor": "2",
        "firmware_version": "cam-1.2.2",
        "assigned_role": "route_verification",
        "health_score": 54,
        "latency_ms": 0,
        "packet_success_rate": 86.5,
        "uptime_percent": 91.2,
        "false_alarm_count": 0,
        "muted": False,
        "disabled": False,
    },
    {
        "node_id": "hybrid_node_03",
        "node_type": "hybrid_node",
        "label": "Lobby Hybrid Safety Node",
        "building": "Grand Meridian Hotel",
        "zone": "Main Lobby",
        "install_location": "Public lobby ceiling column",
        "status": "online",
        "last_heartbeat": None,
        "wifi_rssi": -54,
        "battery": 76.0,
        "risk_level": "SAFE",
        "risk_score": 16,
        "latest_telemetry": None,
        "floor": "G",
        "firmware_version": "hybrid-0.9.6",
        "assigned_role": "crowd_smoke_route_monitoring",
        "health_score": 86,
        "latency_ms": 148,
        "packet_success_rate": 97.1,
        "uptime_percent": 98.4,
        "false_alarm_count": 1,
        "muted": False,
        "disabled": False,
    },
]


DEFAULT_THRESHOLDS: dict[str, Any] = {
    "gas_warning_threshold": 1350,
    "gas_danger_threshold": 2350,
    "temp_warning_threshold": 48.0,
    "temp_critical_threshold": 62.0,
    "flame_debounce_ms": 450,
    "ultrasonic_blocked_distance_cm": 65,
    "panic_hold_duration_ms": 900,
    "buzzer_policy": "critical_only",
    "preset": "Hotel",
}


DEFAULT_SETTINGS: dict[str, Any] = {
    "polling_interval_ms": 7500,
    "retention_days": 30,
    "simulation_speed": 1.0,
    "auto_refresh": True,
    "node_timeout_seconds": 90,
    "notification_rules": ["critical", "offline", "camera_request"],
    "sound_enabled": True,
    "export_csv": True,
    "mode": "HYBRID",
}


def _seeded_telemetry(now: datetime) -> list[dict[str, Any]]:
    return [
        {
            "event_id": "IOT-DEMO-001",
            "node_id": "utility_node_01",
            "timestamp": _iso(now - timedelta(minutes=3)),
            "temperature": 32.4,
            "humidity": 47.0,
            "gas_level": 612,
            "flame_detected": False,
            "button_pressed": False,
            "wifi_rssi": -57,
            "battery": None,
            "risk_level": "SAFE",
            "risk_score": 18,
            "triggers": [],
            "action_status": "recorded",
            "incident_id": None,
        },
        {
            "event_id": "IOT-DEMO-002",
            "node_id": "utility_node_02",
            "timestamp": _iso(now - timedelta(minutes=7)),
            "temperature": 50.8,
            "humidity": 42.0,
            "gas_level": 1410,
            "flame_detected": False,
            "button_pressed": False,
            "wifi_rssi": -71,
            "battery": 82.0,
            "risk_level": "WARNING",
            "risk_score": 46,
            "triggers": ["temperature_rising", "gas_elevated"],
            "action_status": "recorded",
            "incident_id": None,
        },
        {
            "event_id": "IOT-DEMO-003",
            "node_id": "stair_cam_02",
            "timestamp": _iso(now - timedelta(minutes=18)),
            "temperature": None,
            "humidity": None,
            "gas_level": None,
            "flame_detected": False,
            "button_pressed": False,
            "wifi_rssi": -84,
            "battery": None,
            "risk_level": "SAFE",
            "risk_score": 10,
            "triggers": ["node_offline"],
            "action_status": "camera_health_warning",
            "incident_id": None,
        },
    ]


def _seeded_alerts(now: datetime) -> list[dict[str, Any]]:
    return [
        {
            "event_id": "IAL-DEMO-001",
            "node_id": "corridor_cam_01",
            "timestamp": _iso(now - timedelta(minutes=5)),
            "alert_type": "camera_snapshot",
            "message": "Floor 3 corridor snapshot requested for public-area verification",
            "risk_level": "WARNING",
            "risk_score": 52,
            "incident_id": None,
        },
        {
            "event_id": "IAL-DEMO-002",
            "node_id": "hybrid_node_03",
            "timestamp": _iso(now - timedelta(minutes=11)),
            "alert_type": "route_congestion",
            "message": "Lobby hybrid node detected evacuation corridor density increase",
            "risk_level": "WARNING",
            "risk_score": 49,
            "incident_id": None,
        },
    ]


def _normalize_node(node: dict[str, Any], now: datetime) -> dict[str, Any]:
    seeded = next((item for item in SEEDED_NODES if item["node_id"] == node.get("node_id")), {})
    normalized = {**NODE_DEFAULTS, **seeded, **node}
    if not normalized.get("last_heartbeat") and normalized.get("status") not in {"awaiting_telemetry", "offline"}:
        normalized["last_heartbeat"] = _iso(now - timedelta(seconds=28))
    if normalized.get("latest_telemetry") is None and normalized.get("node_type") != "corridor_camera":
        normalized["latest_telemetry"] = {
            "event_id": f"{normalized['node_id'].upper()}-BOOT",
            "node_id": normalized["node_id"],
            "timestamp": normalized.get("last_heartbeat") or _iso(now - timedelta(minutes=2)),
            "temperature": 32.0 if normalized["risk_level"] == "SAFE" else 50.2,
            "humidity": 46.0,
            "gas_level": 650 if normalized["risk_level"] == "SAFE" else 1420,
            "flame_detected": False,
            "button_pressed": False,
            "wifi_rssi": normalized.get("wifi_rssi"),
            "battery": normalized.get("battery"),
            "risk_level": normalized["risk_level"],
            "risk_score": normalized["risk_score"],
            "triggers": [] if normalized["risk_level"] == "SAFE" else ["gas_elevated"],
            "action_status": "demo_seeded" if normalized["status"] != "awaiting_telemetry" else "awaiting_first_packet",
            "incident_id": None,
        }
    return normalized


class IotStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        now = _now()
        return {
            "nodes": [_normalize_node(dict(node), now) for node in SEEDED_NODES],
            "events": _seeded_telemetry(now),
            "alerts": _seeded_alerts(now),
            "camera": {
                "node_id": "corridor_cam_01",
                "snapshot_url": settings.iot_camera_snapshot_url,
                "stream_url": settings.iot_camera_stream_url,
                "last_capture_at": None,
            },
            "thresholds": dict(DEFAULT_THRESHOLDS),
            "calibration": {node["node_id"]: dict(DEFAULT_THRESHOLDS) for node in SEEDED_NODES},
            "settings": dict(DEFAULT_SETTINGS),
            "commands": [],
        }

    def _read(self) -> dict[str, Any]:
        changed = False
        if not self._path.exists():
            payload = self._default_payload()
            self._write(payload)
            return payload
        try:
            payload = json.loads(self._path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            payload = self._default_payload()
            self._write(payload)
            return payload

        now = _now()
        existing_nodes = {node.get("node_id"): node for node in payload.get("nodes", [])}
        normalized_nodes: list[dict[str, Any]] = []
        for seeded in SEEDED_NODES:
            normalized_nodes.append(_normalize_node(existing_nodes.pop(seeded["node_id"], dict(seeded)), now))
        for leftover in existing_nodes.values():
            normalized_nodes.append(_normalize_node(leftover, now))
        if payload.get("nodes") != normalized_nodes:
            payload["nodes"] = normalized_nodes
            changed = True

        if not payload.get("events"):
            payload["events"] = _seeded_telemetry(now)
            changed = True
        payload.setdefault("alerts", [])
        if not payload["alerts"]:
            payload["alerts"] = _seeded_alerts(now)
            changed = True
        payload.setdefault(
            "camera",
            {
                "node_id": "corridor_cam_01",
                "snapshot_url": settings.iot_camera_snapshot_url,
                "stream_url": settings.iot_camera_stream_url,
                "last_capture_at": None,
            },
        )
        payload.setdefault("thresholds", dict(DEFAULT_THRESHOLDS))
        payload["thresholds"] = {**DEFAULT_THRESHOLDS, **payload["thresholds"]}
        payload.setdefault("calibration", {})
        for node in payload["nodes"]:
            payload["calibration"].setdefault(node["node_id"], dict(DEFAULT_THRESHOLDS))
        payload.setdefault("settings", dict(DEFAULT_SETTINGS))
        payload["settings"] = {**DEFAULT_SETTINGS, **payload["settings"]}
        payload.setdefault("commands", [])

        if changed:
            self._write(payload)
        return payload

    def _write(self, payload: dict[str, Any]) -> None:
        self._path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    def list_nodes(self) -> list[dict[str, Any]]:
        with self._lock:
            return [dict(node) for node in self._read()["nodes"]]

    def get_node(self, node_id: str) -> dict[str, Any] | None:
        with self._lock:
            for node in self._read()["nodes"]:
                if node["node_id"] == node_id:
                    return dict(node)
        return None

    def list_events(self) -> list[dict[str, Any]]:
        with self._lock:
            payload = self._read()
            return [dict(event) for event in [*payload["events"], *payload["alerts"]]]

    def get_camera(self) -> dict[str, Any]:
        with self._lock:
            return dict(self._read()["camera"])

    def upsert_node(self, node: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            nodes = payload["nodes"]
            normalized = _normalize_node(node, _now())
            for index, existing in enumerate(nodes):
                if existing["node_id"] == normalized["node_id"]:
                    nodes[index] = {**existing, **normalized}
                    self._write(payload)
                    return dict(nodes[index])
            nodes.append(dict(normalized))
            payload["calibration"][normalized["node_id"]] = dict(DEFAULT_THRESHOLDS)
            self._write(payload)
            return dict(normalized)

    def update_node(self, node_id: str, updates: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            for index, node in enumerate(payload["nodes"]):
                if node["node_id"] == node_id:
                    payload["nodes"][index] = _normalize_node({**node, **updates}, _now())
                    self._write(payload)
                    return dict(payload["nodes"][index])
            raise KeyError(node_id)

    def append_event(self, event: dict[str, Any]) -> None:
        with self._lock:
            payload = self._read()
            payload["events"].append(dict(event))
            payload["events"] = payload["events"][-500:]
            self._write(payload)

    def append_alert(self, alert: dict[str, Any]) -> None:
        with self._lock:
            payload = self._read()
            payload["alerts"].append(dict(alert))
            payload["alerts"] = payload["alerts"][-500:]
            self._write(payload)

    def append_command(self, command: dict[str, Any]) -> None:
        with self._lock:
            payload = self._read()
            payload["commands"].append(dict(command))
            payload["commands"] = payload["commands"][-200:]
            self._write(payload)

    def list_commands(self) -> list[dict[str, Any]]:
        with self._lock:
            return [dict(command) for command in self._read()["commands"]]

    def update_camera(self, **updates: Any) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            payload["camera"] = {**payload["camera"], **updates}
            self._write(payload)
            return dict(payload["camera"])

    def get_thresholds(self) -> dict[str, Any]:
        with self._lock:
            return dict(self._read()["thresholds"])

    def set_thresholds(self, thresholds: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            payload["thresholds"] = {**payload["thresholds"], **thresholds}
            self._write(payload)
            return dict(payload["thresholds"])

    def get_calibration(self, node_id: str) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            return dict(payload["calibration"].get(node_id, DEFAULT_THRESHOLDS))

    def set_calibration(self, node_id: str, calibration: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            payload["calibration"][node_id] = {**DEFAULT_THRESHOLDS, **calibration}
            self._write(payload)
            return dict(payload["calibration"][node_id])

    def get_settings(self) -> dict[str, Any]:
        with self._lock:
            return dict(self._read()["settings"])

    def set_settings(self, settings_update: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            payload["settings"] = {**payload["settings"], **settings_update}
            self._write(payload)
            return dict(payload["settings"])


iot_store = IotStore(settings.iot_store_path)
