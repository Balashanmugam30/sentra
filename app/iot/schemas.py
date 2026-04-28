from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, HttpUrl


RiskLevel = Literal["SAFE", "WARNING", "CRITICAL", "CRITICAL+"]
NodeType = Literal["utility_risk_node", "corridor_camera", "hybrid_node"]
NodeStatus = Literal[
    "online",
    "offline",
    "warning",
    "critical",
    "awaiting_telemetry",
    "maintenance",
    "disabled",
]


class IotTelemetryRequest(BaseModel):
    node_id: str = Field(..., min_length=2, max_length=80)
    timestamp: datetime | None = None
    temperature: float | None = Field(default=None, ge=-40, le=125)
    humidity: float | None = Field(default=None, ge=0, le=100)
    gas_level: int | None = Field(default=None, ge=0, le=4095)
    flame_detected: bool = False
    button_pressed: bool = False
    wifi_rssi: int | None = Field(default=None, ge=-120, le=0)
    battery: float | None = Field(default=None, ge=0, le=100)
    camera_snapshot_url: HttpUrl | None = None


class IotAlertRequest(BaseModel):
    node_id: str = Field(..., min_length=2, max_length=80)
    alert_type: str = Field(..., min_length=2, max_length=80)
    message: str = Field(..., min_length=2, max_length=255)
    risk_level: RiskLevel | None = None
    timestamp: datetime | None = None


class IotTelemetryRecord(BaseModel):
    event_id: str
    node_id: str
    timestamp: datetime
    temperature: float | None = None
    humidity: float | None = None
    gas_level: int | None = None
    flame_detected: bool = False
    button_pressed: bool = False
    wifi_rssi: int | None = None
    battery: float | None = None
    risk_level: RiskLevel
    risk_score: int = Field(..., ge=0, le=100)
    triggers: list[str] = Field(default_factory=list)
    action_status: str = "recorded"
    incident_id: str | None = None


class IotAlertRecord(BaseModel):
    event_id: str
    node_id: str
    timestamp: datetime
    alert_type: str
    message: str
    risk_level: RiskLevel
    risk_score: int
    incident_id: str | None = None


class IotNode(BaseModel):
    node_id: str
    node_type: NodeType
    label: str
    building: str
    zone: str
    install_location: str
    status: NodeStatus
    last_heartbeat: datetime | None = None
    wifi_rssi: int | None = None
    battery: float | None = None
    risk_level: RiskLevel = "SAFE"
    risk_score: int = Field(default=0, ge=0, le=100)
    latest_telemetry: IotTelemetryRecord | None = None
    floor: str = "Unassigned"
    firmware_version: str = "unknown"
    assigned_role: str = "monitoring"
    health_score: int = Field(default=72, ge=0, le=100)
    latency_ms: int = Field(default=0, ge=0)
    packet_success_rate: float = Field(default=99.0, ge=0, le=100)
    uptime_percent: float = Field(default=99.0, ge=0, le=100)
    false_alarm_count: int = Field(default=0, ge=0)
    muted: bool = False
    disabled: bool = False


class IotTelemetryResponse(BaseModel):
    accepted: bool
    node: IotNode
    event: IotTelemetryRecord
    buzzer_command: Literal["off", "pulse", "on"]
    camera_snapshot_requested: bool


class IotAlertResponse(BaseModel):
    accepted: bool
    alert: IotAlertRecord
    node: IotNode


class IotNodesResponse(BaseModel):
    generated_at: datetime
    nodes: list[IotNode]


class IotEventsResponse(BaseModel):
    generated_at: datetime
    events: list[IotTelemetryRecord | IotAlertRecord]


class IotCameraLatestResponse(BaseModel):
    node_id: str
    label: str
    building: str
    zone: str
    public_area_only: bool = True
    snapshot_url: str
    stream_url: str
    last_capture_at: datetime | None = None
    status: NodeStatus


class IotFleetSummary(BaseModel):
    active_nodes: int
    offline_nodes: int
    critical_alerts: int
    avg_health_score: int
    avg_latency_ms: int
    total_events_today: int
    camera_nodes_online: int
    mode: Literal["REAL", "DEMO", "HYBRID"] = "HYBRID"


class IotFleetResponse(BaseModel):
    generated_at: datetime
    summary: IotFleetSummary
    nodes: list[IotNode]


class IotNodeDetailResponse(BaseModel):
    generated_at: datetime
    node: IotNode
    recent_events: list[IotTelemetryRecord | IotAlertRecord]
    diagnostics: dict[str, object]
    calibration: dict[str, object]


class IotNodeCommandRequest(BaseModel):
    label: str | None = Field(default=None, max_length=120)


class IotNodeCommandResponse(BaseModel):
    accepted: bool
    node_id: str
    action: str
    message: str
    node: IotNode


class IotCalibrationRequest(BaseModel):
    gas_warning_threshold: int = Field(..., ge=0, le=4095)
    gas_danger_threshold: int = Field(..., ge=0, le=4095)
    temp_warning_threshold: float = Field(..., ge=-40, le=125)
    temp_critical_threshold: float = Field(..., ge=-40, le=125)
    flame_debounce_ms: int = Field(..., ge=0, le=10_000)
    ultrasonic_blocked_distance_cm: int = Field(..., ge=1, le=600)
    panic_hold_duration_ms: int = Field(..., ge=0, le=10_000)
    buzzer_policy: Literal["off", "warning_only", "critical_only", "always"] = "critical_only"
    preset: str = Field(default="Hotel", max_length=80)


class IotThresholdsResponse(BaseModel):
    generated_at: datetime
    thresholds: dict[str, object]
    presets: list[str]


class IotAnalyticsResponse(BaseModel):
    generated_at: datetime
    time_range: Literal["1h", "24h", "7d", "30d"]
    metrics: dict[str, object]
    series: dict[str, list[dict[str, object]]]


class IotHealthResponse(BaseModel):
    generated_at: datetime
    fleet_health_score: int
    diagnostics: list[dict[str, object]]


class IotFeedResponse(BaseModel):
    generated_at: datetime
    feed: list[dict[str, object]]


class IotSettingsResponse(BaseModel):
    generated_at: datetime
    settings: dict[str, object]


class IotProvisionRequest(BaseModel):
    label: str = Field(..., min_length=2, max_length=120)
    building: str = Field(..., min_length=2, max_length=120)
    floor: str = Field(..., min_length=1, max_length=40)
    zone: str = Field(..., min_length=2, max_length=120)
    node_type: Literal["sensor", "camera", "hybrid"]
    tenant: str = Field(default="TEN-GRAND-MERIDIAN", max_length=120)
    firmware_version: str = Field(default="edge-1.5.0", max_length=80)


class IotProvisionResponse(BaseModel):
    generated_at: datetime
    device: dict[str, object]
    qr_payload: str
    secure_token_preview: str


class IotDataResponse(BaseModel):
    generated_at: datetime
    data: dict[str, object]


class IotFirmwareReleaseRequest(BaseModel):
    version: str = Field(..., min_length=2, max_length=80)
    rollout_percentage: int = Field(default=10, ge=0, le=100)
    target: Literal["esp32", "esp32_cam", "hybrid"] = "esp32"


class IotDemoRunRequest(BaseModel):
    scenario_id: str = Field(..., min_length=2, max_length=80)


class IotRoiRequest(BaseModel):
    rooms: int = Field(..., ge=1, le=100_000)
    floors: int = Field(..., ge=1, le=500)
    staff_count: int = Field(..., ge=1, le=100_000)
    incidents_per_year: int = Field(..., ge=0, le=100_000)
    avg_loss_per_incident: float = Field(..., ge=0, le=100_000_000)
