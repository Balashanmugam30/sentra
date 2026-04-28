"""Pydantic schemas for Omega OS."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class OmegaLiveResponse(BaseModel):
    provider: str = "omega_demo"
    generated_at: str
    metrics: dict[str, Any]
    planetary: dict[str, Any]
    singularity: dict[str, Any]
    top_threats: list[dict[str, Any]]
    recommended_actions: list[dict[str, Any]]


class OmegaResponse(BaseModel):
    provider: str = "omega_demo"
    generated_at: str
    data: dict[str, Any]


class OmegaMutationRequest(BaseModel):
    scenario: str | None = None
    actor: str | None = None
    objective: str | None = None
    mode: str | None = None
    reason: str | None = None


class OmegaMutationResponse(BaseModel):
    ok: bool
    message: str
    generated_at: str
    event: dict[str, Any]
    data: dict[str, Any]

