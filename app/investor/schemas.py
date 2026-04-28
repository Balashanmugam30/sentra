from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class InvestorRecord(BaseModel):
    investor_id: str
    tenant_id: str
    fund_name: str
    partner_name: str
    check_size: int
    stage_fit: str
    geography: str
    thesis_fit: str
    warm_intro: str
    last_meeting: datetime | None = None
    interest_score: int
    probability_to_invest: int
    next_action_date: datetime
    status: str
    created_at: datetime


class InvestorLiveResponse(BaseModel):
    generated_at: datetime
    ARR: int
    MRR: int
    YoY_growth_percent: int
    net_revenue_retention: int
    gross_margin_percent: int
    runway_months: int
    rule_of_40: int
    fundraising_readiness_score: int
    base_valuation: int
    investor_pipeline: int
    board_pack_status: str


class MetricsResponse(BaseModel):
    metrics: dict[str, Any]


class ValuationResponse(BaseModel):
    valuation: dict[str, Any]


class RunwayResponse(BaseModel):
    runway: dict[str, Any]


class CapTableResponse(BaseModel):
    captable: dict[str, Any]


class ReadinessResponse(BaseModel):
    readiness: dict[str, Any]


class BoardResponse(BaseModel):
    board: dict[str, Any]


class DataRoomResponse(BaseModel):
    dataroom: dict[str, Any]


class MnaResponse(BaseModel):
    mna: dict[str, Any]


class IpoResponse(BaseModel):
    ipo: dict[str, Any]


class InvestorsResponse(BaseModel):
    investors: list[InvestorRecord]


class CopilotResponse(BaseModel):
    copilot: dict[str, Any]


class InvestorSummaryResponse(BaseModel):
    summary: dict[str, Any]


class BoardPackResponse(BaseModel):
    boardpack: dict[str, Any]


class FundsResponse(BaseModel):
    funds: list[InvestorRecord]


class InvestorMutationRequest(BaseModel):
    investor_id: str | None = None
    status: str | None = None
    amount: int | None = Field(default=None, ge=0)
    scenario: str | None = None
    fund_name: str | None = None
    partner_name: str | None = None
    check_size: int | None = Field(default=None, ge=0)
    stage_fit: str | None = None
    note: str | None = None


class InvestorMutationResponse(BaseModel):
    ok: bool
    message: str
    data: dict[str, Any] = Field(default_factory=dict)
