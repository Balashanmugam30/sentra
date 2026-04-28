from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class GeoCoordinate(BaseModel):
    lat: float
    lng: float


class GeoIncidentItem(BaseModel):
    incident_id: str
    zone: str
    type: str
    severity: int = Field(..., ge=1, le=5)
    status: str
    risk_level: str
    recommended_action: str | None = None
    source: str
    coordinate: GeoCoordinate
    radius_m: int = Field(..., ge=0)


class GeoResponderItem(BaseModel):
    responder_id: str
    name: str
    role: str
    status: str
    current_zone: str
    battery: int
    signal: str
    last_seen: datetime
    active_task_id: str | None = None
    call_sign: str
    mode: str
    coordinate: GeoCoordinate


class GeoSensorItem(BaseModel):
    device_id: str
    zone: str
    sensor_types: list[str]
    alert_level: str
    latest_alert: str | None = None
    battery: int
    rssi: int
    coordinate: GeoCoordinate
    status: str


class GeoFacilityItem(BaseModel):
    asset_id: str
    asset_type: str
    zone: str
    name: str
    status: str
    online: bool
    mode: str
    last_seen: datetime
    health_score: int
    coordinate: GeoCoordinate


class GeoHotspotItem(BaseModel):
    zone: str
    risk_score: int
    incident_count: int
    movement: str
    coordinate: GeoCoordinate
    radius_m: int


class GeoBlockedRouteItem(BaseModel):
    segment_id: str
    from_zone: str
    to_zone: str
    reason: str
    polyline: list[list[float]]


class GeoSafeZoneItem(BaseModel):
    safe_zone_id: str
    zone: str
    name: str
    coordinate: GeoCoordinate
    capacity: int
    status: str


class GeoHeatCellItem(BaseModel):
    cell_id: str
    center: GeoCoordinate
    intensity: int
    radius_m: int
    source: str


class GeoEnvironmentOverlay(BaseModel):
    provider: str
    wind_kph: float
    wind_direction: str
    rain_mm: float
    visibility_km: float
    aqi: int
    fire_spread_risk: int
    flood_risk: int
    smoke_risk: int


class GeoTrafficSegmentOverlay(BaseModel):
    segment_id: str
    from_zone: str
    to_zone: str
    speed_kph: float
    congestion_score: int
    blocked: bool
    eta_penalty_minutes: int
    polyline: list[list[float]]


class GeoDispatchRouteOverlay(BaseModel):
    route_id: str
    vehicle_type: str
    status: str
    eta_minutes: int
    green_signal_ready: bool
    polyline: list[list[float]]


class GeoPublicSafetyOverlay(BaseModel):
    global_pressure: int
    traffic_segments: list[GeoTrafficSegmentOverlay]
    dispatch_routes: list[GeoDispatchRouteOverlay]
    mobility: dict[str, int | str]
    utilities: dict[str, str]


class GeoOsintHotspot(BaseModel):
    hotspot_id: str
    label: str
    lat: float
    lng: float
    severity: str
    source: str


class GeoOsintOverlay(BaseModel):
    threat_level: str
    reputation_risk: int
    hotspots: list[GeoOsintHotspot]


class GeoLiveResponse(BaseModel):
    generated_at: datetime
    summary_only: bool = False
    partial: bool = False
    stale_data: bool = False
    incidents: list[GeoIncidentItem]
    responders: list[GeoResponderItem]
    sensors: list[GeoSensorItem]
    facilities: list[GeoFacilityItem]
    hotspots: list[GeoHotspotItem]
    blocked_routes: list[GeoBlockedRouteItem]
    safe_zones: list[GeoSafeZoneItem]
    heat_cells: list[GeoHeatCellItem]
    environment_overlay: GeoEnvironmentOverlay | None = None
    public_safety_overlay: GeoPublicSafetyOverlay | None = None
    osint_overlay: GeoOsintOverlay | None = None


class GeoLayerItem(BaseModel):
    layer_id: str
    label: str
    enabled: bool
    restricted: bool | None = None
    count: int = 0


class GeoLayersResponse(BaseModel):
    generated_at: datetime
    layers: list[GeoLayerItem]


class GeoRouteAlternative(BaseModel):
    mode: str
    path: list[str]
    polyline: list[list[float]]
    eta_minutes: int
    risk_score: int


class GeoRouteRequest(BaseModel):
    from_zone: str
    to_zone: str
    mode: Literal["evacuation", "responder", "safest", "fastest"] = "evacuation"


class GeoRouteResponse(BaseModel):
    from_zone: str
    to_zone: str
    mode: str
    route_polyline: list[list[float]]
    eta_minutes: int
    risk_score: int
    blocked_segments: list[GeoBlockedRouteItem]
    alternatives: list[GeoRouteAlternative]


class GeoFocusRequest(BaseModel):
    zone: str


class GeoFocusResponse(BaseModel):
    generated_at: datetime
    zone: str
    center: GeoCoordinate
    polygon: list[list[float]]
    incidents: list[GeoIncidentItem]
    responders: list[GeoResponderItem]
    sensors: list[GeoSensorItem]
    facilities: list[GeoFacilityItem]
    hotspot: GeoHotspotItem | None = None
    blocked_routes: list[GeoBlockedRouteItem]


class GeoTestScenarioRequest(BaseModel):
    scenario: Literal["fire_zone2", "gas_zone4", "mass_panic_gate", "blocked_exit", "multi_zone_pressure"]


class GeoTestScenarioResponse(BaseModel):
    status: str
    scenario: str
    live: GeoLiveResponse
