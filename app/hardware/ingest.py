from __future__ import annotations

from datetime import datetime, timedelta, timezone

from app.hardware.devices import (
    ensure_device,
    get_device,
    list_real_devices,
    update_device_telemetry,
)
from app.hardware.rules import evaluate_telemetry_rules
from app.perception.schemas import SensorZoneState
from app.perception.sensors import ZONE_NAMES, generate_sensor_snapshot
from app.schemas.incident_schema import IncidentCreate
from app.services.incident_service import create_incident, get_all_incidents
from app.simulation.twin import generate_live_twin_state


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _clamp(value: int, lower: int, upper: int) -> int:
    return max(lower, min(upper, value))


def _normalize_zone_sensor(zone: str, base: SensorZoneState, telemetry_items: list[dict[str, object]]) -> SensorZoneState:
    if not telemetry_items:
        return base

    temperatures = [float(item.get("temperature", base.temperature)) for item in telemetry_items if "temperature" in item]
    smoke_values = []
    gas_values = []
    crowd_values = []
    noise_values = []

    for telemetry in telemetry_items:
        if "smoke" in telemetry:
            smoke_values.append(float(telemetry["smoke"]))
        if "flame" in telemetry:
            smoke_values.append(90.0 if float(telemetry["flame"]) >= 1 else 0.0)
        if "gas" in telemetry:
            gas_values.append(float(telemetry["gas"]))
        if "motion" in telemetry:
            crowd_values.append(68.0 if float(telemetry["motion"]) >= 1 else 24.0)
        if "panic_button" in telemetry and float(telemetry["panic_button"]) >= 1:
            crowd_values.append(96.0)
            noise_values.append(88.0)
        if "noise" in telemetry:
            noise_values.append(float(telemetry["noise"]))
        if "vibration" in telemetry:
            noise_values.append(min(100.0, float(telemetry["vibration"]) * 18.0))
        if "door_contact" in telemetry and float(telemetry["door_contact"]) >= 1:
            crowd_values.append(62.0)
        if "power_loss" in telemetry and float(telemetry["power_loss"]) >= 1:
            noise_values.append(64.0)

    temperature = round(sum(temperatures) / len(temperatures)) if temperatures else base.temperature
    smoke = round(max(smoke_values)) if smoke_values else base.smoke_index
    gas = round(max(gas_values)) if gas_values else base.gas_ppm
    crowd = round(max(crowd_values)) if crowd_values else base.crowd_density
    noise = round(max(noise_values)) if noise_values else base.noise_level

    return SensorZoneState(
        zone=zone,
        temperature=_clamp(temperature, 20, 95),
        smoke_index=_clamp(smoke, 0, 100),
        gas_ppm=_clamp(gas, 0, 100),
        crowd_density=_clamp(crowd, 0, 100),
        noise_level=_clamp(noise, 0, 100),
    )


def build_perception_sensor_snapshot(now: datetime | None = None) -> list[SensorZoneState]:
    base_zones = generate_sensor_snapshot(now)
    telemetry_by_zone: dict[str, list[dict[str, object]]] = {}
    for device in list_real_devices():
        if not device.last_telemetry:
            continue
        telemetry_by_zone.setdefault(device.zone, []).append(device.last_telemetry)

    return [
        _normalize_zone_sensor(zone.zone, zone, telemetry_by_zone.get(zone.zone, []))
        for zone in base_zones
    ]


def _next_poll_seconds(rules_triggered: list[str]) -> int:
    return 3 if rules_triggered else 5


def _threat_delta(rules: list[dict[str, str]]) -> int:
    severity_map = {
        "fire_risk": 34,
        "gas_leak": 30,
        "intrusion_watch": 18,
        "emergency_manual_alert": 26,
        "infrastructure_failure": 16,
    }
    return _clamp(sum(severity_map.get(item["rule_name"], 12) for item in rules), 0, 100)


def _has_recent_duplicate(zone: str, incident_type: str, now: datetime) -> bool:
    threshold = now - timedelta(minutes=10)
    for incident in get_all_incidents():
        if incident.status != "active":
            continue
        if incident.location != zone or incident.type != incident_type:
            continue
        if incident.created_at < threshold:
            continue
        return True
    return False


async def _create_rule_incidents(device_id: str, zone: str, rules: list[dict[str, str]]) -> bool:
    created_any = False
    now = _now()
    for rule in rules:
        mapped_type = rule["incident_type"]
        if _has_recent_duplicate(zone, mapped_type, now):
            continue
        severity = 4 if rule["rule_name"] in {"fire_risk", "gas_leak", "emergency_manual_alert"} else 3
        await create_incident(
            IncidentCreate(
                type=mapped_type,
                severity=severity,
                location=zone,
                incident_type=rule["rule_name"],
                confidence=0.92 if severity == 4 else 0.81,
                detected_by=f"hardware:{device_id}",
                recommended_action=rule["reason"],
                priority="critical" if severity == 4 else "high",
            )
        )
        created_any = True
    return created_any


async def process_hardware_ingest(
    *,
    device_id: str,
    zone: str,
    telemetry: dict[str, object],
    source_mode: str = "http",
    system_mode_override: str | None = None,
) -> dict[str, object]:
    inferred_sensors = sorted(
        [
            key
            for key in telemetry
            if key
            in {
                "temperature",
                "humidity",
                "smoke",
                "gas",
                "flame",
                "motion",
                "door_contact",
                "vibration",
                "noise",
                "power_loss",
                "panic_button",
            }
        ]
    )
    device = ensure_device(
        device_id=device_id,
        zone=zone,
        sensors=inferred_sensors,
        device_type="raspberry_pi" if device_id.upper().startswith("RPI") else "esp32",
    )

    incidents = get_all_incidents()
    system_mode = system_mode_override or generate_live_twin_state(incidents)["global_mode"]
    rules = evaluate_telemetry_rules(telemetry=telemetry, system_mode=system_mode)
    latest_alert = rules[0]["alert_label"] if rules else None
    update_device_telemetry(device.device_id, telemetry, latest_alert=latest_alert)
    incident_created = await _create_rule_incidents(device.device_id, zone, rules)

    return {
        "accepted": True,
        "threat_delta": _threat_delta(rules),
        "rules_triggered": [item["rule_name"] for item in rules],
        "incident_created": incident_created,
        "next_poll_seconds": _next_poll_seconds([item["rule_name"] for item in rules]),
    }


async def ingest_mqtt_payload(topic: str, payload: dict[str, object]) -> dict[str, object]:
    parts = topic.split("/")
    device_id = parts[2] if len(parts) >= 3 else str(payload.get("device_id", "MQTT-DEVICE"))
    zone = str(payload.get("zone", "Zone 1"))
    telemetry = dict(payload.get("telemetry", payload))
    telemetry.pop("zone", None)
    telemetry.pop("device_id", None)
    return await process_hardware_ingest(
        device_id=device_id,
        zone=zone,
        telemetry=telemetry,
        source_mode="mqtt",
    )
