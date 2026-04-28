from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class FunnelStage(BaseModel):
    stage_id: str
    tenant_id: str
    name: str
    count: int
    previous_stage_count: int | None = None
    conversion_rate: float | None = None
    dropoff_rate: float | None = None


class LeadSource(BaseModel):
    source_id: str
    tenant_id: str
    name: str
    leads: int
    conversion_rate: float
    cac: int
    pipeline_value: int
    status: str


class ConversionMetric(BaseModel):
    metric_id: str
    tenant_id: str
    label: str
    value: float
    unit: str
    benchmark: float
    recommendation: str


class DemoConversion(BaseModel):
    tenant_id: str
    demo_views: int
    demos_booked: int
    proposals_sent: int
    paid_closed: int
    avg_days_to_close: int
    close_confidence: int
    strongest_segment: str


class ReferralProgram(BaseModel):
    program_id: str
    tenant_id: str
    name: str
    tier: str
    referrals_sent: int
    referrals_accepted: int
    revenue_generated: int
    top_ambassador: str
    reward: str


class ViralLoop(BaseModel):
    tenant_id: str
    shares_per_customer: float
    invite_conversion: float
    organic_coefficient: float
    growth_multiplier: float
    loop_cycle_days: int
    top_loop: str


class PricingExperiment(BaseModel):
    experiment_id: str
    tenant_id: str
    name: str
    plan: str
    variant: str
    conversion_rate: float
    arpu: int
    confidence: int
    winner: bool


class SalesAiAction(BaseModel):
    action_id: str
    tenant_id: str
    title: str
    segment: str
    priority: str
    expected_revenue: int
    confidence: int
    next_step: str


class WaitlistSignal(BaseModel):
    tenant_id: str
    people_waiting: int
    invite_waves: int
    top_regions: list[str]
    launch_city_ranking: list[str]
    top_requested_feature: str
    expansion_heat: int


class AuthoritySignal(BaseModel):
    signal_id: str
    tenant_id: str
    label: str
    value: int
    impact: str


class RevenueGrowthLiveResponse(BaseModel):
    generated_at: datetime
    visitors_month: int
    leads: int
    trials: int
    paid_customers: int
    enterprise_customers: int
    mrr: int
    arr: int
    visitor_to_lead: float
    lead_to_trial: float
    trial_to_paid: float
    referral_revenue: int
    viral_coefficient: float
    avg_cac: int
    ltv_cac: float
    growth_score: int
    best_cac_channel: str


class FunnelResponse(BaseModel):
    funnel: list[FunnelStage]


class LeadSourcesResponse(BaseModel):
    sources: list[LeadSource]


class ConversionResponse(BaseModel):
    metrics: list[ConversionMetric]
    demo_to_paid: DemoConversion
    recommendations: list[SalesAiAction]


class ReferralsResponse(BaseModel):
    programs: list[ReferralProgram]


class ViralResponse(BaseModel):
    viral: ViralLoop


class PricingResponse(BaseModel):
    experiments: list[PricingExperiment]
    best_variant: PricingExperiment


class SalesAiResponse(BaseModel):
    actions: list[SalesAiAction]


class WaitlistResponse(BaseModel):
    waitlist: WaitlistSignal


class AuthorityResponse(BaseModel):
    signals: list[AuthoritySignal]
    trust_score: int


class RevenueGrowthMutationRequest(BaseModel):
    company_name: str | None = None
    contact_name: str | None = None
    email: str | None = None
    source: str | None = None
    campaign: str | None = None
    scenario: str | None = None
    variant: str | None = None
    expected_value: int | None = Field(default=None, ge=0)


class RevenueGrowthMutationResponse(BaseModel):
    ok: bool
    message: str
    data: dict[str, Any] = Field(default_factory=dict)
