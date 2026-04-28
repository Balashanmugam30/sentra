"""Pydantic schemas for Autonomy OS endpoints."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field

AutonomyMode = Literal["advisory", "approval_required", "semi_auto", "full_auto", "lockdown_mode"]


class AutonomyMetricsPayload(BaseModel):
    tenant_id: str
    decision_supremacy: int
    trust_score: int
    learning_improvement_percent: int
    accepted_decisions_percent: int
    rejected_decisions_percent: int
    override_rate_percent: int
    best_objective: str
    avg_recovery_eta_minutes: int
    playbooks_learned: int
    prediction_accuracy_percent: int
    self_heal_success_percent: int
    human_confidence: int
    board_confidence: int
    current_objective: str
    autonomy_mode: AutonomyMode
    updated_at: str


class AutonomyLiveResponse(BaseModel):
    provider: str = "autonomy_demo"
    mode: str = "self_evolving"
    generated_at: str
    metrics: AutonomyMetricsPayload
    top_decision: dict[str, Any]
    active_objective: dict[str, Any]
    plan_summary: dict[str, Any]
    prediction_summary: dict[str, Any]
    trust_summary: dict[str, Any]
    health_summary: dict[str, Any]
    reasoning_summary: str
    recommended_actions: list[dict[str, Any]]


class AutonomyResponse(BaseModel):
    provider: str = "autonomy_demo"
    generated_at: str
    data: dict[str, Any]


class AutonomyMutationRequest(BaseModel):
    objective: str | None = Field(default=None, min_length=2)
    mode: AutonomyMode | None = None
    actor: str | None = None
    reason: str | None = None
    note: str | None = None


class AutonomyMutationResponse(BaseModel):
    status: str
    generated_at: str
    event: dict[str, Any]
    data: dict[str, Any]

