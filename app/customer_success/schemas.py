from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field

HealthStatus = Literal["healthy", "watch", "risk", "critical"]
LifecycleStage = Literal["onboarding", "adoption", "growth", "renewal", "rescue", "expansion"]


class CustomerSuccessAccount(BaseModel):
    account_id: str
    tenant_id: str
    workspace_name: str
    plan: str
    MRR: int = Field(ge=0)
    ARR: int = Field(ge=0)
    seats_used: int = Field(ge=0)
    seats_limit: int = Field(ge=1)
    feature_usage: dict[str, int]
    login_frequency: int = Field(ge=0, le=100)
    API_usage: int = Field(ge=0)
    report_usage: int = Field(ge=0)
    AI_actions_used: int = Field(ge=0)
    adoption_score: int = Field(ge=0, le=100)
    onboarding_completion: int = Field(ge=0, le=100)
    stakeholder_engagement: int = Field(ge=0, le=100)
    support_tickets: int = Field(ge=0)
    avg_resolution_time: float = Field(ge=0)
    NPS_score: int = Field(ge=0, le=10)
    CSAT_score: int = Field(ge=0, le=100)
    payment_status: str
    uptime_experience: int = Field(ge=0, le=100)
    sentiment_trend: str
    churn_risk: int = Field(ge=0, le=100)
    expansion_potential: int = Field(ge=0, le=100)
    renewal_date: datetime
    contract_value: int = Field(ge=0)
    account_owner: str
    lifecycle_stage: LifecycleStage
    updated_at: datetime


class HealthSnapshot(BaseModel):
    tenant_id: str
    workspace_name: str
    health_score: int
    status: HealthStatus
    drivers: list[str]
    risks: list[str]
    trend: str


class ChurnPrediction(BaseModel):
    tenant_id: str
    workspace_name: str
    risk_percent: int
    top_causes: list[str]
    save_actions: list[str]
    estimated_revenue_at_risk: int
    severity: HealthStatus


class RenewalRecord(BaseModel):
    tenant_id: str
    workspace_name: str
    renewal_date: datetime
    days_until_renewal: int
    bucket: str
    renewal_probability: int
    owner: str
    blockers: list[str]
    decision_makers: list[str]
    last_touchpoint: str
    expansion_opportunity: int
    contract_value: int


class ExpansionOpportunity(BaseModel):
    tenant_id: str
    workspace_name: str
    opportunity_score: int
    expected_MRR_gain: int
    recommended_offer: str
    close_probability: int
    signals: list[str]


class OnboardingProgress(BaseModel):
    tenant_id: str
    workspace_name: str
    setup_complete: bool
    invited_users: bool
    first_login: bool
    first_report_created: bool
    first_AI_action_used: bool
    integrations_connected: bool
    admin_trained: bool
    executive_review_complete: bool
    time_to_value: int
    activation_score: int
    onboarding_health: HealthStatus


class SupportSnapshot(BaseModel):
    tenant_id: str
    workspace_name: str
    ticket_volume: int
    avg_resolution_time: float
    resolution_SLA: int
    priority_escalations: int
    support_sentiment: str
    NPS_score: int
    CSAT_score: int


class CopilotAction(BaseModel):
    action_id: str
    tenant_id: str
    workspace_name: str
    recommendation: str
    why: str
    priority: Literal["low", "medium", "high", "critical"]
    expected_impact: str
    owner: str
    due: str


class SuccessLiveResponse(BaseModel):
    generated_at: datetime
    NRR: int
    health_mix: dict[str, int]
    at_risk_accounts: list[ChurnPrediction]
    expansion_pipeline: int
    renewals_due_90d: int
    top_churn_reasons: list[str]
    ai_save_actions: list[CopilotAction]
    summary: str


class HealthResponse(BaseModel):
    accounts: list[HealthSnapshot]


class ChurnResponse(BaseModel):
    predictions: list[ChurnPrediction]
    revenue_at_risk: int
    top_causes: list[str]


class RenewalsResponse(BaseModel):
    renewals: list[RenewalRecord]
    buckets: dict[str, int]


class ExpansionResponse(BaseModel):
    opportunities: list[ExpansionOpportunity]
    expansion_pipeline: int


class OnboardingResponse(BaseModel):
    accounts: list[OnboardingProgress]


class SupportResponse(BaseModel):
    accounts: list[SupportSnapshot]
    escalations_open: int
    avg_resolution_time: float


class SuccessMetricsResponse(BaseModel):
    NRR: int
    gross_retention: int
    health_average: int
    at_risk_revenue: int
    expansion_pipeline: int
    renewal_pipeline: int
    NPS_average: float
    CSAT_average: float
    accounts_count: int
    lifecycle_mix: dict[str, int]
    executive_summary: str


class CopilotResponse(BaseModel):
    actions: list[CopilotAction]


class SuccessMutationRequest(BaseModel):
    tenant_id: str | None = None
    scenario: str | None = None
    note: str | None = None


class SuccessMutationResponse(BaseModel):
    ok: bool
    message: str
    data: dict[str, Any] = Field(default_factory=dict)
