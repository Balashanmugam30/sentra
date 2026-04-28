from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class TrafficSegmentItem(BaseModel):
    segment_id: str
    from_zone: str
    to_zone: str
    speed_kph: float = Field(..., ge=0)
    congestion_score: int = Field(..., ge=0, le=100)
    blocked: bool
    incident_related: bool
    eta_penalty_minutes: int = Field(..., ge=0)
    polyline: list[list[float]]


class TransitLineItem(BaseModel):
    line_id: str
    mode: Literal["bus", "metro", "shuttle"]
    name: str
    status: Literal["running", "delayed", "paused"]
    delay_minutes: int = Field(..., ge=0)
    crowding_level: int = Field(..., ge=0, le=100)
    affected_zones: list[str]


class DispatchRouteItem(BaseModel):
    route_id: str
    vehicle_type: Literal["ambulance", "fire", "police"]
    from_zone: str
    to_zone: str
    status: Literal["ready", "reserved", "constrained"]
    eta_minutes: int = Field(..., ge=0)
    green_signal_ready: bool
    recommended_use: str
    polyline: list[list[float]]


class UtilityState(BaseModel):
    power_status: Literal["normal", "watch", "degraded", "outage"]
    water_status: Literal["normal", "watch", "degraded", "outage"]
    network_status: Literal["normal", "watch", "degraded", "outage"]
    street_light_status: Literal["normal", "watch", "degraded", "outage"]
    generator_status: Literal["ready", "active", "strained", "offline"]
    recommendation: str


class MobilityState(BaseModel):
    zone_inflow: int = Field(..., ge=0)
    zone_outflow: int = Field(..., ge=0)
    pedestrian_pressure: int = Field(..., ge=0, le=100)
    queue_density: int = Field(..., ge=0, le=100)
    evac_flow_score: int = Field(..., ge=0, le=100)
    top_pressure_zone: str


class PublicSafetyLiveResponse(BaseModel):
    summary_only: bool = False
    partial: bool = False
    stale_data: bool = False
    updated_at: datetime
    traffic_provider: str
    transit_provider: str
    utility_provider: str
    city_mode: str
    traffic: list[TrafficSegmentItem]
    transit: list[TransitLineItem]
    dispatch: list[DispatchRouteItem]
    utilities: UtilityState
    mobility: MobilityState
    global_pressure: int = Field(..., ge=0, le=100)
    public_alerts: list[str]


class TrafficGridResponse(BaseModel):
    summary_only: bool = False
    updated_at: datetime
    provider: str
    segments: list[TrafficSegmentItem]


class TransitResponse(BaseModel):
    summary_only: bool = False
    updated_at: datetime
    provider: str
    lines: list[TransitLineItem]


class UtilityResponse(BaseModel):
    summary_only: bool = False
    updated_at: datetime
    provider: str
    utilities: UtilityState


class RoutePriorityRequest(BaseModel):
    vehicle_type: Literal["ambulance", "fire", "police"]
    from_zone: str
    to_zone: str


class RoutePriorityResponse(BaseModel):
    vehicle_type: str
    from_zone: str
    to_zone: str
    priority_route: list[str]
    eta_minutes: int = Field(..., ge=0)
    closures: list[str]
    recommended_actions: list[str]
    green_signal_ready: bool


class PublicSafetyTestScenarioRequest(BaseModel):
    scenario: Literal[
        "traffic_jam_gate",
        "metro_shutdown",
        "ambulance_priority",
        "city_power_outage",
        "crowd_surge_gate",
        "multi_corridor_block",
        "normal_day",
    ]


class PublicSafetyTestScenarioResponse(BaseModel):
    status: str
    scenario: str
    live: PublicSafetyLiveResponse
