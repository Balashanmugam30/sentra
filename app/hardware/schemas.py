from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

DeviceType = Literal[
    "esp32",
    "raspberry_pi",
    "arduino_gateway",
    "relay_controller",
    "camera_metadata_node",
]
SensorType = Literal[
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
]
ActuatorCommand = Literal[
    "siren_on",
    "siren_off",
    "relay_on",
    "relay_off",
    "flash_beacon",
    "restart_device",
]
HardwareState = Literal["healthy", "warning", "degraded", "critical"]
DeliveryMode = Literal["mqtt", "http", "mock"]
RuleName = Literal[
    "fire_risk",
    "gas_leak",
    "intrusion_watch",
    "emergency_manual_alert",
    "infrastructure_failure",
]


class HardwareRegisterRequest(BaseModel):
    device_id: str = Field(..., min_length=3, max_length=120)
    device_type: DeviceType
    zone: str = Field(..., min_length=3, max_length=40)
    sensors: list[SensorType] = Field(default_factory=list)
    firmware: str = Field(..., min_length=1, max_length=40)
    preferred_transport: DeliveryMode | None = None


class HardwareRegisterResponse(BaseModel):
    status: str
    registered_at: datetime
    auth_token: str
    heartbeat_interval: int = Field(..., ge=5)


class HardwareIngestRequest(BaseModel):
    device_id: str = Field(..., min_length=3, max_length=120)
    zone: str = Field(..., min_length=3, max_length=40)
    telemetry: dict[str, int | float | bool | str]


class HardwareIngestResponse(BaseModel):
    accepted: bool
    threat_delta: int = Field(..., ge=0, le=100)
    rules_triggered: list[RuleName]
    incident_created: bool
    next_poll_seconds: int = Field(..., ge=1)


class HardwareTestRequest(BaseModel):
    scenario: Literal[
        "fire_zone2",
        "gas_zone4",
        "panic_zone1",
        "power_loss_zone3",
        "intrusion_zone5",
    ]


class HardwareTestResponse(BaseModel):
    status: str
    scenario: str
    ingest: HardwareIngestResponse


class HardwareCommandRequest(BaseModel):
    device_id: str = Field(..., min_length=3, max_length=120)
    command: ActuatorCommand


class HardwareCommandResponse(BaseModel):
    queued: bool
    delivered_mode: DeliveryMode


class HardwareDeviceItem(BaseModel):
    device_id: str
    zone: str
    type: DeviceType
    online: bool
    last_seen: datetime
    firmware: str
    health_score: int = Field(..., ge=0, le=100)
    sensors: list[SensorType]
    battery: int = Field(..., ge=0, le=100)
    rssi: int = Field(..., le=0)
    mode: Literal["mock", "real"]


class HardwareDevicesResponse(BaseModel):
    generated_at: datetime
    devices: list[HardwareDeviceItem]


class HardwareTopDeviceItem(BaseModel):
    device_id: str
    zone: str
    status: Literal["online", "offline", "warning"]
    battery: int = Field(..., ge=0, le=100)
    rssi: int = Field(..., le=0)
    last_seen: datetime
    latest_alert: str | None = None


class HardwareLiveResponse(BaseModel):
    generated_at: datetime
    global_hardware_state: HardwareState
    online_devices: int = Field(..., ge=0)
    offline_devices: int = Field(..., ge=0)
    battery_low_count: int = Field(..., ge=0)
    signal_weak_count: int = Field(..., ge=0)
    active_sensor_alerts: int = Field(..., ge=0)
    top_devices: list[HardwareTopDeviceItem]
    recommended_actions: list[str]
    summary: str


class HardwareMqttWebhookRequest(BaseModel):
    topic: str = Field(..., min_length=1)
    payload: dict[str, int | float | bool | str]
