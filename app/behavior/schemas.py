from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class BehaviorZone(BaseModel):
    zone_id: str
    tenant_id: str
    name: str
    population: int
    density: int
    exits: int
    visible_exits: int
    smoke_level: int
    fire_severity: int
    alarm_clarity: int
    alarm_status: str
    language_mix: list[str]
    avg_age_band: str
    mobility_percent: int
    visibility_score: int
    noise_level: int
    previous_alerts: int
    leadership_presence: int
    conflicting_instructions: int
    time_pressure: int
    updated_at: str
    panic_score: int
    freeze_score: int
    compliance: dict[str, int]
    vulnerability_score: int
    vulnerable_occupants: int
    herd_score: int
    bottleneck_score: int
    recommended_communication: str
    intervention: str
    explanation: str


class BehaviorSummaryResponse(BaseModel):
    summary: dict[str, Any]


class BehaviorZonesResponse(BaseModel):
    zones: list[BehaviorZone]


class BehaviorMetricResponse(BaseModel):
    data: dict[str, Any]


class BehaviorRecommendationsResponse(BaseModel):
    recommendations: list[dict[str, Any]]


class BehaviorRunRequest(BaseModel):
    scenario: str | None = None


class BehaviorRunResponse(BaseModel):
    ok: bool
    message: str
    data: dict[str, Any] = Field(default_factory=dict)


class CrowdMetricResponse(BaseModel):
    data: dict[str, Any]


class CrowdMutationRequest(BaseModel):
    scenario: str | None = None
    environment_id: str | None = None
    avoid_zone: str | None = None


class CrowdMutationResponse(BaseModel):
    ok: bool
    message: str
    data: dict[str, Any] = Field(default_factory=dict)


class DecisionMetricResponse(BaseModel):
    data: dict[str, Any]


class DecisionMutationRequest(BaseModel):
    scenario: str | None = None
    scenario_id: str | None = None
    approval_id: str | None = None
    reason: str | None = None


class DecisionMutationResponse(BaseModel):
    ok: bool
    message: str
    data: dict[str, Any] = Field(default_factory=dict)


class LearningMetricResponse(BaseModel):
    data: dict[str, Any]


class LearningMutationRequest(BaseModel):
    scenario: str | None = None
    policy_id: str | None = None


class LearningMutationResponse(BaseModel):
    ok: bool
    message: str
    data: dict[str, Any] = Field(default_factory=dict)
