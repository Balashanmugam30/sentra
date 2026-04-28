from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


BillingInterval = Literal["monthly", "annual"]
SubscriptionStatus = Literal["trial", "active", "past_due", "cancel_at_renewal", "canceled", "approval_required"]
InvoiceStatus = Literal["paid", "open", "overdue", "failed", "refunded"]


class RevenuePlan(BaseModel):
    plan_key: str
    name: str
    audience: str
    monthly_price: int
    yearly_price: int
    included_seats: int
    max_seats: int | None = None
    ai_quota: int
    api_quota: int
    storage_quota_gb: int
    support_tier: str
    enabled_modules: list[str]
    upgrade_signal: str


class SeatSnapshot(BaseModel):
    seats_purchased: int
    seats_used: int
    pending_invites: int
    suspended_users: int
    available_seats: int
    utilization_percent: int
    recommendation: str


class QuotaMetric(BaseModel):
    key: str
    label: str
    included: int
    used: int
    remaining: int
    overage_estimate: int
    unit: str


class RevenueSubscription(BaseModel):
    tenant_id: str
    customer: str
    plan_key: str
    plan_name: str
    status: SubscriptionStatus
    billing_interval: BillingInterval
    monthly_recurring_revenue: int
    annual_contract_value: int
    renewal_date: str
    cancel_at_renewal: bool
    trial_days_remaining: int
    proration_preview: int
    approval_required: bool
    seats: SeatSnapshot


class RevenueInvoice(BaseModel):
    invoice_id: str
    customer: str
    tenant_id: str
    billing_period: str
    subtotal: int
    taxes: int
    credits: int
    total: int
    status: InvoiceStatus
    due_date: str
    download_url: str


class PaymentHealth(BaseModel):
    payment_method_valid: bool
    retry_attempts: int
    failed_charges: int
    grace_period_remaining: int
    collections_risk: str
    next_action: str


class RenewalEvent(BaseModel):
    tenant_id: str
    customer: str
    renewal_date: str
    amount: int
    risk: str
    owner: str


class FinanceAlert(BaseModel):
    alert_id: str
    type: str
    title: str
    severity: Literal["low", "medium", "high", "critical"]
    customer: str
    value_at_risk: int
    recommended_action: str


class RevenueCustomer(BaseModel):
    tenant_id: str
    customer: str
    plan: str
    arr: int
    growth_rate: int
    usage_score: int
    renewal_risk: str
    executive_owner: str


class ForecastPoint(BaseModel):
    month: str
    conservative: int
    expected: int
    aggressive: int


class RevenueSummary(BaseModel):
    provider: Literal["demo", "stripe_ready"]
    generated_at: str
    mrr: int
    arr: int
    net_revenue_retention: int
    churn_percent: float
    expansion_mrr: int
    contraction_mrr: int
    arpu: int
    ltv_estimate: int
    gross_margin_percent: int
    renewal_pipeline: int
    collections_ratio: int
    active_customers: int
    overdue_revenue: int
    growth_trend: list[dict[str, Any]]
    investor_summary: str


class RevenueBillingSnapshot(BaseModel):
    summary: RevenueSummary
    plans: list[RevenuePlan]
    subscription: RevenueSubscription
    usage: list[QuotaMetric]
    invoices: list[RevenueInvoice]
    payment_health: PaymentHealth
    renewals: list[RenewalEvent]
    alerts: list[FinanceAlert]
    customers: list[RevenueCustomer]
    forecast: list[ForecastPoint]


class RevenueMutationRequest(BaseModel):
    plan_key: str | None = None
    interval: BillingInterval | None = None
    seats: int | None = Field(default=None, ge=1)
    invoice_id: str | None = None
    reason: str | None = None


class RevenueMutationResponse(BaseModel):
    ok: bool
    message: str
    subscription: RevenueSubscription | None = None
    data: dict[str, Any] = Field(default_factory=dict)


class RevenuePlansResponse(BaseModel):
    plans: list[RevenuePlan]


class RevenueInvoicesResponse(BaseModel):
    invoices: list[RevenueInvoice]


class RevenueUsageResponse(BaseModel):
    usage: list[QuotaMetric]


class RevenueForecastResponse(BaseModel):
    forecast: list[ForecastPoint]


class RevenueAlertsResponse(BaseModel):
    alerts: list[FinanceAlert]


class RevenueCustomersResponse(BaseModel):
    customers: list[RevenueCustomer]

