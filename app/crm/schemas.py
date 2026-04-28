from __future__ import annotations

from datetime import date, datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


LeadStatus = Literal[
    "new",
    "qualified",
    "contacted",
    "demo_booked",
    "proposal_sent",
    "negotiation",
    "won",
    "lost",
    "nurture",
]

DealStage = Literal[
    "pipeline",
    "qualified",
    "demo",
    "proposal",
    "legal",
    "procurement",
    "closed_won",
    "closed_lost",
]

ActivityType = Literal["calls", "emails", "meetings", "demo", "follow_up", "contract"]


class Lead(BaseModel):
    id: str
    tenant_id: str
    company_name: str
    contact_name: str
    email: str
    phone: str = ""
    role: str
    industry: str
    country: str
    company_size: str
    source: str
    score: int = Field(ge=0, le=100)
    status: LeadStatus
    notes: str = ""
    created_at: datetime
    owner: str
    deal_value_estimate: int = Field(ge=0)


class LeadCreateRequest(BaseModel):
    company_name: str
    contact_name: str
    email: str
    phone: str = ""
    role: str = "Operations Leader"
    industry: str = "enterprise"
    country: str = "Global"
    company_size: str = "1000+"
    source: str = "website"
    status: LeadStatus = "new"
    notes: str = ""
    owner: str = "Sentra Growth"
    deal_value_estimate: int = Field(default=75_000, ge=0)


class LeadImportRequest(BaseModel):
    leads: list[LeadCreateRequest]


class LeadPatchRequest(BaseModel):
    company_name: str | None = None
    contact_name: str | None = None
    email: str | None = None
    phone: str | None = None
    role: str | None = None
    industry: str | None = None
    country: str | None = None
    company_size: str | None = None
    source: str | None = None
    status: LeadStatus | None = None
    notes: str | None = None
    owner: str | None = None
    deal_value_estimate: int | None = Field(default=None, ge=0)


class LeadsResponse(BaseModel):
    leads: list[Lead]


class Deal(BaseModel):
    id: str
    tenant_id: str
    lead_id: str | None = None
    company_name: str
    stage: DealStage
    value: int = Field(ge=0)
    probability: int = Field(ge=0, le=100)
    expected_close_date: date
    owner: str
    risk: str
    competitors: list[str] = Field(default_factory=list)
    timeline: list[str] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime


class DealCreateRequest(BaseModel):
    lead_id: str | None = None
    company_name: str
    stage: DealStage = "pipeline"
    value: int = Field(default=120_000, ge=0)
    probability: int = Field(default=35, ge=0, le=100)
    expected_close_date: date | None = None
    owner: str = "Sentra Growth"
    risk: str = "medium"
    competitors: list[str] = Field(default_factory=list)
    timeline: list[str] = Field(default_factory=list)


class DealPatchRequest(BaseModel):
    company_name: str | None = None
    stage: DealStage | None = None
    value: int | None = Field(default=None, ge=0)
    probability: int | None = Field(default=None, ge=0, le=100)
    expected_close_date: date | None = None
    owner: str | None = None
    risk: str | None = None
    competitors: list[str] | None = None
    timeline: list[str] | None = None


class MoveStageRequest(BaseModel):
    stage: DealStage


class DealsResponse(BaseModel):
    deals: list[Deal]


class Activity(BaseModel):
    id: str
    tenant_id: str
    lead_id: str | None = None
    deal_id: str | None = None
    activity_type: ActivityType
    subject: str
    notes: str
    owner: str
    created_at: datetime
    next_step: str | None = None


class ActivityLogRequest(BaseModel):
    lead_id: str | None = None
    deal_id: str | None = None
    activity_type: ActivityType = "follow_up"
    subject: str
    notes: str = ""
    owner: str = "Sentra Growth"
    next_step: str | None = None


class ActivitiesResponse(BaseModel):
    activities: list[Activity]


class DemoBooking(BaseModel):
    id: str
    tenant_id: str
    lead_id: str | None = None
    company_name: str
    contact_name: str
    scheduled_at: datetime
    owner: str
    status: Literal["scheduled", "completed", "cancelled", "no_show"]
    agenda: str
    meeting_url: str


class DemoBookRequest(BaseModel):
    lead_id: str | None = None
    company_name: str
    contact_name: str
    scheduled_at: datetime | None = None
    owner: str = "Sentra Growth"
    agenda: str = "Sentra executive crisis intelligence demo"


class DemosResponse(BaseModel):
    demos: list[DemoBooking]


class CrmMutationResponse(BaseModel):
    ok: bool
    message: str
    data: dict[str, Any] = Field(default_factory=dict)


class ForecastResponse(BaseModel):
    monthly_pipeline: int
    weighted_pipeline: int
    likely_closes: list[Deal]
    ARR_projection: int
    MRR_projection: int
    win_rate: float
    sales_cycle_days: int


class LeadScoringResponse(BaseModel):
    scored_leads: list[Lead]
    model_factors: dict[str, int]
    recommendations: list[str]


class GrowthMetricsResponse(BaseModel):
    CAC: int
    LTV: int
    LTV_CAC: float
    Conversion_Rate: float
    Lead_Velocity: float
    Pipeline_Velocity: int
    Churn_Impact: int
    Expansion_Potential: int
    ai_recommendations: list[str]
