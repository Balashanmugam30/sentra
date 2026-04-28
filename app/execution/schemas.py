from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class ExecutionLiveResponse(BaseModel):
    generated_at: str
    ARR: int
    MRR: int
    growth_percent: int
    cash_balance: int
    monthly_burn: int
    runway_months: int
    employees: int
    countries: int
    NPS: int
    gross_margin_percent: int
    LTV_CAC: float
    board_readiness: int
    CEO_confidence: int
    execution_score: int


class ExecutionResponse(BaseModel):
    data: dict[str, Any]


class ExecutionMutationRequest(BaseModel):
    scenario: str | None = None
    amount: int | None = Field(default=None, ge=0)
    hires: int | None = Field(default=None, ge=0)
    note: str | None = None


class ExecutionMutationResponse(BaseModel):
    ok: bool
    message: str
    data: dict[str, Any] = Field(default_factory=dict)
