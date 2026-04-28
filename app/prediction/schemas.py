from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    incidents: list[dict[str, object]] = Field(default_factory=list)
    timestamp: datetime | None = None


class PredictionItem(BaseModel):
    zone: str
    risk_score: float = Field(..., ge=0, le=100)
    trend: Literal["low", "rising", "critical"]
    eta_seconds: int = Field(..., ge=0)
    confidence: float = Field(..., ge=0, le=1)


class PredictionResponse(BaseModel):
    generated_at: datetime
    predictions: list[PredictionItem]


class FireSpreadForecastItem(BaseModel):
    source_zone: str
    target_zone: str
    probability: float = Field(..., ge=0, le=0.98)
    eta_minutes: int = Field(..., ge=0)
    heat_index: int = Field(..., ge=0, le=100)
    status: Literal["watch", "danger", "critical"]


class FireSpreadResponse(BaseModel):
    generated_at: datetime
    active_sources: int = Field(..., ge=0)
    forecasts: list[FireSpreadForecastItem]


class SafeZoneRecommendation(BaseModel):
    zone: str
    capacity_score: int = Field(..., ge=0, le=100)
    safety_score: int = Field(..., ge=0, le=100)


class BlockedZoneItem(BaseModel):
    zone: str
    reason: str


class EvacuationRouteItem(BaseModel):
    from_zone: str
    to_zone: str
    eta_minutes: int = Field(..., ge=0)
    priority: Literal["low", "medium", "high"]


class EvacuationResponse(BaseModel):
    generated_at: datetime
    global_status: Literal["stable", "caution", "critical"]
    recommended_safe_zones: list[SafeZoneRecommendation]
    blocked_zones: list[BlockedZoneItem]
    routes: list[EvacuationRouteItem]
    alerts: list[str]


class AvailableUnits(BaseModel):
    fire_teams: int = Field(..., ge=0)
    medical_teams: int = Field(..., ge=0)
    security_teams: int = Field(..., ge=0)
    drones: int = Field(..., ge=0)


class ResourceDeploymentItem(BaseModel):
    zone: str
    priority: Literal["low", "medium", "high", "critical"]
    fire_teams: int = Field(..., ge=0)
    medical_teams: int = Field(..., ge=0)
    security_teams: int = Field(..., ge=0)
    drone_support: bool
    eta_minutes: int = Field(..., ge=0)
    containment_eta_minutes: int = Field(..., ge=0)


class ResourceDeploymentResponse(BaseModel):
    generated_at: datetime
    global_load: Literal["normal", "elevated", "overloaded"]
    available_units: AvailableUnits
    deployments: list[ResourceDeploymentItem]
    shortages: list[str]
    recommendations: list[str]


class OccupantAlertItem(BaseModel):
    zone: str
    priority: Literal["normal", "elevated", "critical"]
    message: str


class ResponderMessageItem(BaseModel):
    team: Literal["fire", "medical", "security"]
    zone: str
    message: str


class CommunicationResponse(BaseModel):
    generated_at: datetime
    threat_level: Literal["normal", "elevated", "critical"]
    occupant_alerts: list[OccupantAlertItem]
    responder_messages: list[ResponderMessageItem]
    executive_summary: list[str]
    escalations: list[str]


class CommanderActionItem(BaseModel):
    priority: int = Field(..., ge=1)
    title: str


class CommanderResponse(BaseModel):
    generated_at: datetime
    incident_mode: Literal[
        "monitor",
        "response",
        "evacuation",
        "lockdown",
        "mass-casualty",
    ]
    severity_index: int = Field(..., ge=0, le=100)
    top_actions: list[CommanderActionItem]
    resource_orders: list[str]
    strategic_objectives: list[str]
    next_15_min_plan: list[str]
    executive_status: str


class CoordinatorConflictItem(BaseModel):
    source: Literal[
        "live",
        "fire-spread",
        "evacuation",
        "resources",
        "communications",
        "commander",
        "memory",
    ]
    issue: str


class CoordinatedActionItem(BaseModel):
    agent: Literal[
        "live",
        "fire-spread",
        "evacuation",
        "resources",
        "communications",
        "commander",
        "memory",
    ]
    action: str


class CoordinatorResponse(BaseModel):
    generated_at: datetime
    global_mode: Literal["stabilize", "evacuation", "lockdown", "containment"]
    system_health: Literal["normal", "elevated", "critical"]
    conflicts_detected: list[CoordinatorConflictItem]
    priority_stack: list[str]
    coordinated_actions: list[CoordinatedActionItem]
    cross_agent_score: int = Field(..., ge=0, le=100)
    recommended_next_phase: str


class HotspotZoneItem(BaseModel):
    zone: str
    score: int = Field(..., ge=0, le=100)


class TrustedSafeZoneItem(BaseModel):
    zone: str
    reliability: int = Field(..., ge=0, le=100)


class HistoricalRouteItem(BaseModel):
    from_zone: str
    to_zone: str
    success_rate: int = Field(..., ge=0, le=100)


class ResourceEffectivenessItem(BaseModel):
    zone: str
    best_unit: str
    impact_score: int = Field(..., ge=0, le=100)


class MemoryResponse(BaseModel):
    generated_at: datetime
    total_incidents_observed: int = Field(..., ge=0)
    hotspot_zones: list[HotspotZoneItem]
    trusted_safe_zones: list[TrustedSafeZoneItem]
    historical_route_success: list[HistoricalRouteItem]
    resource_effectiveness: list[ResourceEffectivenessItem]
    learning_status: Literal["active"]


class LearningDecisionResponse(BaseModel):
    generated_at: datetime
    adaptive_actions: list[str]
    confidence: int = Field(..., ge=0, le=100)
    based_on_events: int = Field(..., ge=0)
