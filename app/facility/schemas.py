from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


FacilityConnectorName = Literal[
    "access_control",
    "hvac_bms",
    "pa_system",
    "cctv_metadata",
    "elevator_controller",
    "fire_panel",
    "lighting_controller",
    "campus_dispatch",
]
FacilityConnectorMode = Literal["real", "mock", "offline_fallback"]
FacilityGlobalState = Literal["normal", "alert", "lockdown", "degraded", "emergency"]
FacilityScope = Literal["zone", "building", "campus"]
DoorCommand = Literal["lock", "unlock", "pulse_open"]
HvacCommand = Literal["shutdown", "purge_air", "normal_mode"]
AnnouncementTemplate = Literal[
    "evacuate_now",
    "shelter_in_place",
    "security_alert",
    "test_message",
    "all_clear",
]
FacilityScenario = Literal[
    "fire_zone2",
    "gas_zone3",
    "intrusion_zone1",
    "campus_lockdown",
    "all_clear",
]


class FacilityConnectorItem(BaseModel):
    name: FacilityConnectorName
    status: Literal["ready", "standby", "degraded", "offline"]
    mode: FacilityConnectorMode


class FacilityAssetItem(BaseModel):
    asset_id: str
    asset_type: FacilityConnectorName
    zone: str
    name: str
    status: str
    online: bool
    mode: FacilityConnectorMode
    last_seen: datetime
    health_score: int = Field(..., ge=0, le=100)


class FacilityAssetGroup(BaseModel):
    asset_type: FacilityConnectorName
    assets: list[FacilityAssetItem]


class FacilityEventItem(BaseModel):
    timestamp: datetime
    source: str
    message: str
    severity: Literal["normal", "high", "critical"]


class FacilityLiveResponse(BaseModel):
    generated_at: datetime
    global_facility_state: FacilityGlobalState
    connected_systems: int = Field(..., ge=0)
    assets_online: int = Field(..., ge=0)
    assets_offline: int = Field(..., ge=0)
    active_commands: int = Field(..., ge=0)
    critical_events: int = Field(..., ge=0)
    zones_secured: int = Field(..., ge=0)
    recommended_actions: list[str]
    summary: str
    connectors: list[FacilityConnectorItem]


class FacilityAssetsResponse(BaseModel):
    generated_at: datetime
    groups: list[FacilityAssetGroup]


class FacilityEventsResponse(BaseModel):
    generated_at: datetime
    events: list[FacilityEventItem]


class FacilityActionResponse(BaseModel):
    status: Literal["completed", "queued"]
    action: str
    mode: FacilityConnectorMode
    triggered_assets: list[str]
    approval_required: bool = False
    required_role: str | None = None


class FacilityLockdownRequest(BaseModel):
    scope: FacilityScope
    zone: str | None = None
    reason: str


class FacilityDoorCommandRequest(BaseModel):
    asset_id: str
    command: DoorCommand


class FacilityHvacCommandRequest(BaseModel):
    zone: str
    command: HvacCommand


class FacilityAnnouncementRequest(BaseModel):
    scope: FacilityScope
    zone: str | None = None
    template: AnnouncementTemplate


class FacilityElevatorRecallRequest(BaseModel):
    building: str


class FacilityFirePanelEventRequest(BaseModel):
    zone: str
    alarm: str


class FacilityFirePanelEventResponse(BaseModel):
    status: Literal["accepted"]
    incident_created: bool
    action: str


class FacilityTestScenarioRequest(BaseModel):
    scenario: FacilityScenario


class FacilityTestScenarioResponse(BaseModel):
    status: Literal["completed"]
    scenario: FacilityScenario
    actions: list[FacilityActionResponse]

