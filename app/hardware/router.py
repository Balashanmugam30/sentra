from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.hardware.devices import (
    build_devices_snapshot,
    build_live_hardware_snapshot,
    get_device,
    queue_command,
    register_device,
)
from app.hardware.ingest import ingest_mqtt_payload, process_hardware_ingest
from app.hardware.mqtt_client import mqtt_enabled, publish_device_command
from app.offline.engine import queue_event_if_needed
from app.hardware.schemas import (
    HardwareCommandRequest,
    HardwareCommandResponse,
    HardwareDevicesResponse,
    HardwareIngestRequest,
    HardwareIngestResponse,
    HardwareLiveResponse,
    HardwareMqttWebhookRequest,
    HardwareRegisterRequest,
    HardwareRegisterResponse,
    HardwareTestRequest,
    HardwareTestResponse,
)
from app.rbac.guard import require_permission

router = APIRouter(prefix="/hardware", tags=["Hardware"])


@router.get("/live", response_model=HardwareLiveResponse)
def get_hardware_live_route(
    _: dict[str, object] = Depends(require_permission("hardware.control")),
) -> HardwareLiveResponse:
    snapshot = build_live_hardware_snapshot()
    return HardwareLiveResponse(**snapshot)


@router.get("/devices", response_model=HardwareDevicesResponse)
def get_hardware_devices_route(
    _: dict[str, object] = Depends(require_permission("hardware.control")),
) -> HardwareDevicesResponse:
    return HardwareDevicesResponse(
        generated_at=build_live_hardware_snapshot()["generated_at"],
        devices=build_devices_snapshot(),
    )


@router.post("/register", response_model=HardwareRegisterResponse)
def post_hardware_register_route(
    request: Request,
    payload: HardwareRegisterRequest,
) -> HardwareRegisterResponse:
    device = register_device(
        device_id=payload.device_id,
        device_type=payload.device_type,
        zone=payload.zone,
        sensors=list(payload.sensors),
        firmware=payload.firmware,
        preferred_transport=payload.preferred_transport,
    )
    append_audit_event(
        category="hardware",
        action="device_registration",
        severity="medium",
        target_module="hardware",
        status="success",
        reason=f"Registered device {payload.device_id}",
        request=request,
        actor_email="hardware@sentra.local",
        actor_role="security_lead",
        target_id=payload.device_id,
        after_state={"zone": payload.zone, "device_type": payload.device_type},
        risk_score=30,
    )
    return HardwareRegisterResponse(
        status="registered",
        registered_at=device.registered_at,
        auth_token=device.auth_token,
        heartbeat_interval=device.heartbeat_interval,
    )


@router.post("/ingest", response_model=HardwareIngestResponse)
async def post_hardware_ingest_route(payload: HardwareIngestRequest) -> HardwareIngestResponse:
    result = await process_hardware_ingest(
        device_id=payload.device_id,
        zone=payload.zone,
        telemetry=dict(payload.telemetry),
        source_mode="http",
    )
    queue_event_if_needed(
        source="hardware",
        event_type="telemetry",
        payload={
            "device_id": payload.device_id,
            "zone": payload.zone,
            "telemetry": dict(payload.telemetry),
        },
        applied_locally=True,
    )
    return HardwareIngestResponse(**result)


@router.post("/test-sensor", response_model=HardwareTestResponse)
async def post_hardware_test_sensor_route(
    request: Request,
    payload: HardwareTestRequest,
    identity: dict[str, object] = Depends(require_permission("hardware.control")),
) -> HardwareTestResponse:
    scenarios = {
        "fire_zone2": {
            "device_id": "ESP32-ZONE2-01",
            "zone": "Zone 2",
            "device_type": "esp32",
            "sensors": ["temperature", "smoke", "gas", "motion"],
            "telemetry": {"temperature": 67, "smoke": 74, "gas": 61, "motion": 1, "battery": 92, "rssi": -58},
            "system_mode": None,
        },
        "gas_zone4": {
            "device_id": "ESP32-ZONE4-01",
            "zone": "Zone 4",
            "device_type": "esp32",
            "sensors": ["temperature", "gas", "smoke"],
            "telemetry": {"temperature": 41, "smoke": 26, "gas": 82, "battery": 89, "rssi": -63},
            "system_mode": None,
        },
        "panic_zone1": {
            "device_id": "GATEWAY-ZONE1-01",
            "zone": "Zone 1",
            "device_type": "arduino_gateway",
            "sensors": ["panic_button", "noise", "motion"],
            "telemetry": {"panic_button": 1, "noise": 84, "motion": 1, "battery": 84, "rssi": -67},
            "system_mode": None,
        },
        "power_loss_zone3": {
            "device_id": "RPI-ZONE3-01",
            "zone": "Zone 3",
            "device_type": "raspberry_pi",
            "sensors": ["power_loss", "temperature", "noise"],
            "telemetry": {"power_loss": 1, "temperature": 29, "noise": 47, "battery": 78, "rssi": -72},
            "system_mode": None,
        },
        "intrusion_zone5": {
            "device_id": "ESP32-ZONE5-01",
            "zone": "Zone 5",
            "device_type": "esp32",
            "sensors": ["motion", "door_contact"],
            "telemetry": {"motion": 1, "door_contact": 1, "battery": 91, "rssi": -56},
            "system_mode": "lockdown",
        },
    }
    scenario = scenarios[payload.scenario]
    register_device(
        device_id=scenario["device_id"],
        device_type=scenario["device_type"],
        zone=scenario["zone"],
        sensors=list(scenario["sensors"]),
        firmware="1.0.0",
        preferred_transport=None,
    )
    result = await process_hardware_ingest(
        device_id=scenario["device_id"],
        zone=scenario["zone"],
        telemetry=dict(scenario["telemetry"]),
        source_mode="mock",
        system_mode_override=scenario["system_mode"],
    )
    append_audit_event(
        category="hardware",
        action="suspicious_device_activity",
        severity="high",
        target_module="hardware",
        status="success",
        reason=f"Hardware scenario {payload.scenario} executed",
        request=request,
        identity=identity,
        target_id=scenario["device_id"],
        risk_score=63,
    )
    return HardwareTestResponse(
        status="completed",
        scenario=payload.scenario,
        ingest=HardwareIngestResponse(**result),
    )


@router.post("/command", response_model=HardwareCommandResponse)
async def post_hardware_command_route(
    request: Request,
    payload: HardwareCommandRequest,
    identity: dict[str, object] = Depends(require_permission("hardware.control")),
) -> HardwareCommandResponse:
    device = get_device(payload.device_id)
    if device is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Device '{payload.device_id}' not found",
        )

    queue_command(payload.device_id, payload.command)
    if device.preferred_transport == "mqtt" and mqtt_enabled() and publish_device_command(
        payload.device_id,
        {"command": payload.command},
    ):
        delivered_mode = "mqtt"
    elif device.mode == "real":
        delivered_mode = "http"
    else:
        delivered_mode = "mock"

    queue_event_if_needed(
        source="hardware",
        event_type="command",
        payload={
            "device_id": payload.device_id,
            "command": payload.command,
            "delivered_mode": delivered_mode,
        },
        applied_locally=True,
    )
    append_audit_event(
        category="hardware",
        action="device_command",
        severity="medium",
        target_module="hardware",
        status="success",
        reason=f"Device command {payload.command}",
        request=request,
        identity=identity,
        target_id=payload.device_id,
        after_state={"command": payload.command, "mode": delivered_mode},
        risk_score=44,
    )
    return HardwareCommandResponse(
        queued=True,
        delivered_mode=delivered_mode,
    )


@router.post("/mqtt-webhook", response_model=HardwareIngestResponse)
async def post_hardware_mqtt_webhook_route(
    payload: HardwareMqttWebhookRequest,
) -> HardwareIngestResponse:
    result = await ingest_mqtt_payload(payload.topic, dict(payload.payload))
    return HardwareIngestResponse(**result)
