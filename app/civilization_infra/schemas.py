from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class CivilizationLiveResponse(BaseModel):
    generated_at: str
    countries_connected: int
    cities_active: int
    population_supported: int
    hospitals_connected: int
    universities: int
    power_grid_uptime: float
    water_security_score: int
    transport_nodes: int
    food_reserve_days: int
    disaster_forecast_accuracy: int
    recovery_coordination_score: int
    civilization_score: int
    label: str
    backbone_thesis: str


class CivilizationResponse(BaseModel):
    generated_at: str
    data: dict[str, Any]


class CivilizationMutationRequest(BaseModel):
    scenario: str | None = None


class CivilizationMutationResponse(BaseModel):
    ok: bool
    message: str
    data: dict[str, Any]

