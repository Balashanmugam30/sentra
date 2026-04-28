"""Pydantic schemas for World Command Grid endpoints."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class WorldMetricsPayload(BaseModel):
    tenant_id: str
    countries_live: int
    threats_active: int
    global_stability: int
    continuity_score: int
    supremacy_score: int
    forecast_accuracy: int
    economic_pressure: str
    pandemic_watch_zones: int
    climate_alerts: int
    supply_chain_chokepoints: int
    diplomacy_index: int
    satellite_resilience: int
    generated_mode: str
    updated_at: str


class WorldLiveResponse(BaseModel):
    provider: str = "world_demo"
    generated_at: str
    metrics: WorldMetricsPayload
    earth_twin: dict[str, Any]
    top_threats: list[dict[str, Any]]
    continuity: dict[str, Any]
    supremacy: dict[str, Any]
    recommended_actions: list[dict[str, Any]]


class WorldResponse(BaseModel):
    provider: str = "world_demo"
    generated_at: str
    data: dict[str, Any]


class WorldMutationRequest(BaseModel):
    scenario: str | None = None
    actor: str | None = None
    note: str | None = None


class WorldMutationResponse(BaseModel):
    ok: bool
    message: str
    generated_at: str
    event: dict[str, Any]
    data: dict[str, Any]

