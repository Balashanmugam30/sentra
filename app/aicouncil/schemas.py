from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class AICouncilMetricResponse(BaseModel):
    data: dict[str, Any]


class AICouncilListResponse(BaseModel):
    items: list[dict[str, Any]]


class AICouncilMutationRequest(BaseModel):
    scenario_id: str | None = Field(default=None, max_length=100)
    objective: str | None = Field(default=None, max_length=80)
    plan_id: str | None = Field(default=None, max_length=100)
    action_id: str | None = Field(default=None, max_length=100)
    reason: str | None = Field(default=None, max_length=280)
    mode: str | None = Field(default=None, max_length=80)
    domain: str | None = Field(default=None, max_length=100)


class AICouncilMutationResponse(BaseModel):
    ok: bool
    message: str
    data: dict[str, Any] = Field(default_factory=dict)

