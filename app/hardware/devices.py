from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from secrets import token_hex


@dataclass
class DeviceRecord:
    device_id: str
    device_type: str
    zone: str
    sensors: list[str]
    firmware: str
    preferred_transport: str
    mode: str
    auth_token: str
    heartbeat_interval: int
    registered_at: datetime
    last_seen: datetime
    last_telemetry: dict[str, object] = field(default_factory=dict)
    battery: int = 100
    rssi: int = -55
    latest_alert: str | None = None
    last_command: str | None = None


_device_store: dict[str, DeviceRecord] = {}


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _heartbeat_for(device_type: str) -> int:
    if device_type == "raspberry_pi":
        return 10
    if device_type == "camera_metadata_node":
        return 8
    return 5


def _default_transport(device_type: str) -> str:
    if device_type in {"raspberry_pi", "arduino_gateway"}:
        return "http"
    return "mqtt"


def register_device(
    *,
    device_id: str,
    device_type: str,
    zone: str,
    sensors: list[str],
    firmware: str,
    preferred_transport: str | None,
    mode: str = "real",
) -> DeviceRecord:
    existing = _device_store.get(device_id)
    now = _now()
    if existing is not None:
        existing.device_type = device_type
        existing.zone = zone
        existing.sensors = list(sensors)
        existing.firmware = firmware
        existing.preferred_transport = preferred_transport or existing.preferred_transport
        existing.mode = mode
        return existing

    record = DeviceRecord(
        device_id=device_id,
        device_type=device_type,
        zone=zone,
        sensors=list(sensors),
        firmware=firmware,
        preferred_transport=preferred_transport or _default_transport(device_type),
        mode=mode,
        auth_token=token_hex(16),
        heartbeat_interval=_heartbeat_for(device_type),
        registered_at=now,
        last_seen=now,
    )
    _device_store[device_id] = record
    return record


def ensure_device(
    *,
    device_id: str,
    zone: str,
    sensors: list[str],
    device_type: str = "esp32",
) -> DeviceRecord:
    existing = _device_store.get(device_id)
    if existing is not None:
        return existing
    return register_device(
        device_id=device_id,
        device_type=device_type,
        zone=zone,
        sensors=sensors,
        firmware="unknown",
        preferred_transport=None,
        mode="real",
    )


def update_device_telemetry(
    device_id: str,
    telemetry: dict[str, object],
    *,
    latest_alert: str | None = None,
) -> DeviceRecord:
    record = _device_store[device_id]
    record.last_seen = _now()
    record.last_telemetry = dict(telemetry)
    record.battery = max(0, min(100, int(float(telemetry.get("battery", record.battery)))))
    record.rssi = int(float(telemetry.get("rssi", record.rssi)))
    if latest_alert is not None:
        record.latest_alert = latest_alert
    return record


def get_device(device_id: str) -> DeviceRecord | None:
    existing = _device_store.get(device_id)
    if existing is not None:
        return existing
    return next((device for device in _mock_devices() if device.device_id == device_id), None)


def list_real_devices() -> list[DeviceRecord]:
    return sorted(_device_store.values(), key=lambda item: (item.zone, item.device_id))


def _mock_devices() -> list[DeviceRecord]:
    now = _now()
    return [
        DeviceRecord(
            device_id="ESP32-ZONE2-01",
            device_type="esp32",
            zone="Zone 2",
            sensors=["temperature", "smoke", "gas", "motion"],
            firmware="1.0.0",
            preferred_transport="http",
            mode="mock",
            auth_token="mock-token-zone2",
            heartbeat_interval=5,
            registered_at=now - timedelta(minutes=15),
            last_seen=now - timedelta(seconds=4),
            last_telemetry={"temperature": 36, "smoke": 18, "gas": 7, "motion": 0, "battery": 92, "rssi": -58},
            battery=92,
            rssi=-58,
        ),
        DeviceRecord(
            device_id="RPI-ZONE4-01",
            device_type="raspberry_pi",
            zone="Zone 4",
            sensors=["temperature", "noise", "vibration", "power_loss"],
            firmware="2.1.3",
            preferred_transport="http",
            mode="mock",
            auth_token="mock-token-zone4",
            heartbeat_interval=10,
            registered_at=now - timedelta(minutes=22),
            last_seen=now - timedelta(seconds=9),
            last_telemetry={"temperature": 33, "noise": 22, "vibration": 0, "power_loss": 0, "battery": 88, "rssi": -61},
            battery=88,
            rssi=-61,
        ),
        DeviceRecord(
            device_id="GATEWAY-ZONE1-01",
            device_type="arduino_gateway",
            zone="Zone 1",
            sensors=["panic_button", "door_contact", "smoke"],
            firmware="0.9.4",
            preferred_transport="mqtt",
            mode="mock",
            auth_token="mock-token-zone1",
            heartbeat_interval=5,
            registered_at=now - timedelta(minutes=30),
            last_seen=now - timedelta(seconds=6),
            last_telemetry={"panic_button": 0, "door_contact": 0, "smoke": 12, "battery": 84, "rssi": -67},
            battery=84,
            rssi=-67,
        ),
    ]


def list_devices(include_mock_fallback: bool = True) -> list[DeviceRecord]:
    real = list_real_devices()
    if real or not include_mock_fallback:
        return real
    return _mock_devices()


def _is_online(record: DeviceRecord) -> bool:
    return (_now() - record.last_seen).total_seconds() <= record.heartbeat_interval * 3


def _health_score(record: DeviceRecord) -> int:
    score = 100
    if not _is_online(record):
        score -= 45
    if record.battery < 25:
        score -= 22
    elif record.battery < 45:
        score -= 10
    if record.rssi < -80:
        score -= 20
    elif record.rssi < -70:
        score -= 10
    if record.latest_alert:
        score -= 8
    return max(0, min(100, score))


def build_devices_snapshot() -> list[dict[str, object]]:
    devices = list_devices()
    return [
        {
            "device_id": device.device_id,
            "zone": device.zone,
            "type": device.device_type,
            "online": _is_online(device),
            "last_seen": device.last_seen,
            "firmware": device.firmware,
            "health_score": _health_score(device),
            "sensors": list(device.sensors),
            "battery": device.battery,
            "rssi": device.rssi,
            "mode": device.mode,
        }
        for device in devices
    ]


def build_live_hardware_snapshot() -> dict[str, object]:
    devices = list_devices()
    online_devices = len([device for device in devices if _is_online(device)])
    offline_devices = len(devices) - online_devices
    battery_low_count = len([device for device in devices if device.battery < 25])
    signal_weak_count = len([device for device in devices if device.rssi < -75])
    active_sensor_alerts = len([device for device in devices if device.latest_alert is not None])

    if active_sensor_alerts >= 2 or offline_devices >= 2:
        global_state = "critical"
    elif active_sensor_alerts >= 1 or battery_low_count > 0:
        global_state = "degraded"
    elif signal_weak_count > 0:
        global_state = "warning"
    else:
        global_state = "healthy"

    top_devices = sorted(
        devices,
        key=lambda item: (
            item.latest_alert is None,
            _health_score(item),
            -item.battery,
            item.device_id,
        ),
    )[:5]
    recommended_actions: list[str] = []
    if battery_low_count:
        recommended_actions.append("Recharge or replace low-battery edge nodes")
    if signal_weak_count:
        recommended_actions.append("Improve WiFi placement for weak-signal devices")
    if active_sensor_alerts:
        recommended_actions.append("Inspect top alerting devices and confirm zone conditions")
    if not recommended_actions:
        recommended_actions.append("Hardware gateway healthy; continue live telemetry monitoring")

    summary = (
        f"{online_devices} devices online, {offline_devices} offline, "
        f"{active_sensor_alerts} active device alerts across the edge gateway."
    )

    return {
        "generated_at": _now(),
        "global_hardware_state": global_state,
        "online_devices": online_devices,
        "offline_devices": offline_devices,
        "battery_low_count": battery_low_count,
        "signal_weak_count": signal_weak_count,
        "active_sensor_alerts": active_sensor_alerts,
        "top_devices": [
            {
                "device_id": device.device_id,
                "zone": device.zone,
                "status": "offline" if not _is_online(device) else "warning" if device.latest_alert else "online",
                "battery": device.battery,
                "rssi": device.rssi,
                "last_seen": device.last_seen,
                "latest_alert": device.latest_alert,
            }
            for device in top_devices
        ],
        "recommended_actions": recommended_actions[:4],
        "summary": summary,
    }


def queue_command(device_id: str, command: str) -> DeviceRecord:
    record = _device_store.get(device_id)
    if record is None:
        record = get_device(device_id)
        if record is None:
            raise KeyError(device_id)
        return record
    record.last_command = command
    return record
