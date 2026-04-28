from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class ZoneTwinState(BaseModel):
    zone: str
    risk_score: int = Field(..., ge=0, le=100)
    occupancy: int = Field(..., ge=0, le=100)
    status: Literal["stable", "restricted", "evacuating"]
    safe_score: int = Field(..., ge=0, le=100)
    fire_threat: bool


class CorridorTwinState(BaseModel):
    from_zone: str
    to_zone: str
    traffic_load: int = Field(..., ge=0, le=100)
    status: Literal["clear", "moderate", "busy"]


class ResponderTwinState(BaseModel):
    team: Literal["fire", "medical", "security", "drone"]
    target_zone: str
    eta_minutes: int = Field(..., ge=0)
    status: Literal["enroute", "staged", "active"]


class SimulationResponse(BaseModel):
    generated_at: datetime
    global_mode: Literal["normal", "caution", "evacuation", "lockdown", "critical"]
    system_health: Literal["healthy", "stressed", "critical"]
    zones: list[ZoneTwinState]
    corridors: list[CorridorTwinState]
    responders: list[ResponderTwinState]
    summary: list[str]


class TimelineZoneState(BaseModel):
    zone: str
    risk_score: int = Field(..., ge=0, le=100)
    occupancy: int = Field(..., ge=0, le=100)
    status: Literal["stable", "restricted", "evacuating"]


class TimelineSnapshot(BaseModel):
    minute: Literal[0, 5, 10, 15]
    global_mode: Literal["normal", "caution", "evacuation", "lockdown", "critical"]
    zones: list[TimelineZoneState]
    corridor_loads: int = Field(..., ge=0)
    active_responders: int = Field(..., ge=0)


class TimelineResponse(BaseModel):
    generated_at: datetime
    snapshots: list[TimelineSnapshot]
    forecast_summary: list[str]


class ScenarioRequest(BaseModel):
    incident_zone: str
    severity: int = Field(..., ge=1, le=4)
    event_type: str


class ScenarioImpactItem(BaseModel):
    minute: Literal[5, 10, 15]
    event: str


class ScenarioResponse(BaseModel):
    generated_at: datetime
    scenario: str
    recommended_mode: Literal["normal", "caution", "evacuation", "lockdown", "critical"]
    severity_index: int = Field(..., ge=0, le=100)
    impact_chain: list[ScenarioImpactItem]
    affected_zones: list[str]
    recommended_actions: list[str]
    resource_load: Literal["low", "medium", "high", "critical"]


class WarRoomAgentItem(BaseModel):
    name: str
    priority: str
    confidence: int = Field(..., ge=0, le=100)


class WarRoomResponse(BaseModel):
    generated_at: datetime
    global_state: Literal["normal", "elevated", "critical"]
    agents: list[WarRoomAgentItem]
    conflicts: list[str]
    consensus_plan: list[str]
    commander_decision: str
    response_score: int = Field(..., ge=0, le=100)
