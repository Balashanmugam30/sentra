from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class GrowthRegion(BaseModel):
    region_id: str
    tenant_id: str
    name: str
    status: str
    regional_hq: str
    countries_live: int
    pipeline_arr: int
    owner: str


class GrowthCountry(BaseModel):
    country_id: str
    tenant_id: str
    name: str
    region: str
    currency: str
    market_score: int
    compliance_complexity: int
    sales_cycle_days: int
    ARR_potential: int
    competition_index: int
    channel_strength: int
    government_opportunity: int
    deployment_readiness: int
    status: str
    launched_at: datetime | None = None


class Territory(BaseModel):
    territory_id: str
    tenant_id: str
    name: str
    country: str
    vertical_focus: str
    cities: str
    ARR_potential: int
    pipeline_arr: int
    owner: str
    score: int
    coverage_status: str


class ChannelPartner(BaseModel):
    partner_id: str
    tenant_id: str
    name: str
    partner_type: str
    country_coverage: list[str]
    pipeline_influenced: int
    ARR_closed: int
    commission_due: int
    certification_score: int
    win_rate: int
    status: str


class GrowthContract(BaseModel):
    contract_id: str
    tenant_id: str
    account_name: str
    country: str
    deal_type: str
    stage: str
    value: int
    probability: int
    expected_close_date: datetime
    owner: str
    risk: str
    competitors: list[str]
    created_at: datetime


class PricingPlan(BaseModel):
    pricing_id: str
    tenant_id: str
    country: str
    plan: str
    currency: str
    local_monthly: int
    local_annual: int
    usd_equivalent_monthly: int
    tax_percent: int
    discount_band_percent: int
    partner_commission_percent: int
    premium_uplift_percent: int


class WhiteLabelProgram(BaseModel):
    franchise_id: str
    tenant_id: str
    name: str
    partner_name: str
    custom_domain: str
    custom_logo: str
    custom_theme: str
    reseller_owned_billing: bool
    regional_hosting_tag: str
    language_pack: str
    status: str
    created_at: datetime


class ExpansionRecommendation(BaseModel):
    recommendation_id: str
    title: str
    reason: str
    impact: str
    priority: str
    confidence: int
    cta: str


class GrowthLiveResponse(BaseModel):
    generated_at: datetime
    countries_live: int
    regions_active: int
    pipeline_arr: int
    closed_arr: int
    open_government_deals: int
    partners_active: int
    launches_this_quarter: int
    expansion_score: int
    best_market: str
    fastest_win_cycle: str
    highest_ticket_size: str


class RegionsResponse(BaseModel):
    regions: list[GrowthRegion]


class CountriesResponse(BaseModel):
    countries: list[GrowthCountry]


class TerritoriesResponse(BaseModel):
    territories: list[Territory]


class ChannelPartnersResponse(BaseModel):
    partners: list[ChannelPartner]


class ContractsResponse(BaseModel):
    contracts: list[GrowthContract]


class PricingResponse(BaseModel):
    pricing: list[PricingPlan]


class ForecastResponse(BaseModel):
    forecast: dict[str, Any]


class PipelineResponse(BaseModel):
    pipeline: dict[str, Any]


class WhiteLabelResponse(BaseModel):
    programs: list[WhiteLabelProgram]


class ExpansionAiResponse(BaseModel):
    recommendations: list[ExpansionRecommendation]


class GrowthMutationRequest(BaseModel):
    deal_id: str | None = None
    customer_id: str | None = None
    stage: str | None = None
    owner: str | None = None
    note: str | None = None
    country: str | None = None
    region: str | None = None
    partner_id: str | None = None
    partner_name: str | None = None
    account_name: str | None = None
    deal_type: str | None = None
    value: int | None = Field(default=None, ge=0)
    plan: str | None = None
    percent: int | None = None
    name: str | None = None
    scenario: str | None = None


class GrowthMutationResponse(BaseModel):
    ok: bool
    message: str
    data: dict[str, Any] = Field(default_factory=dict)


class SalesDeal(BaseModel):
    deal_id: str
    company: str
    arr_value: int
    owner: str
    stage: str
    probability: int
    next_step: str
    risk_flags: list[str]
    expected_close_date: datetime
    source: str
    industry: str
    notes: list[str]


class LeadScore(BaseModel):
    lead_id: str
    company: str
    source: str
    industry: str
    company_size: int
    urgency: int
    industry_fit: int
    budget_signal: int
    geography: str
    engagement_score: int
    security_need: int
    buying_intent: int
    ai_score: int
    recommended_action: str


class FunnelStageMetric(BaseModel):
    stage: str
    count: int
    conversion_rate: float
    dropoff_rate: float
    revenue_value: int


class ChannelRoi(BaseModel):
    source: str
    visitors: int
    leads: int
    cpl: int
    cac: int
    close_rate: float
    roi: float
    pipeline_value: int


class CustomerHealth(BaseModel):
    customer_id: str
    customer: str
    status: str
    adoption_score: int
    seats_used: int
    seats_purchased: int
    support_tickets: int
    sentiment: str
    renewal_date: datetime
    arr: int
    expansion_potential: int
    risk_score: int
    nps: int
    csat: int
    next_success_action: str


class RenewalSignal(BaseModel):
    renewal_id: str
    customer: str
    due_bucket: str
    renewal_date: datetime
    arr: int
    risk: str
    owner: str
    recommended_playbook: str


class ExpansionOpportunity(BaseModel):
    opportunity_id: str
    customer: str
    type: str
    potential_arr: int
    confidence: int
    trigger: str
    next_action: str


class RepPerformance(BaseModel):
    rep: str
    pipeline: int
    weighted_forecast: int
    closed_arr: int
    attainment: int
    win_rate: float


class GrowthSummaryResponse(BaseModel):
    generated_at: datetime
    pipeline_value: int
    weighted_forecast: int
    visitors: int
    leads: int
    demos_booked_percent: float
    sql_percent: float
    close_percent: float
    cac: int
    cpl: int
    viral_coefficient: float
    renewal_pipeline: int
    expansion_pipeline: int
    churn_risk_accounts: int
    customer_health_score: int
    quarter_forecast: int
    best_case: int
    worst_case: int


class DealsResponse(BaseModel):
    deals: list[SalesDeal]


class LeadsResponse(BaseModel):
    leads: list[LeadScore]


class FunnelAnalyticsResponse(BaseModel):
    stages: list[FunnelStageMetric]
    channels: list[ChannelRoi]
    referral_engine: dict[str, Any]
    leaks: list[str]


class CustomersResponse(BaseModel):
    customers: list[CustomerHealth]
    expansions: list[ExpansionOpportunity]


class RenewalsResponse(BaseModel):
    renewals: list[RenewalSignal]


class ForecastingResponse(BaseModel):
    forecast: dict[str, Any]
    reps: list[RepPerformance]
