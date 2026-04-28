from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


BillingInterval = Literal["monthly", "annual"]
BillingStatus = Literal["trialing", "active", "past_due", "canceled", "unpaid", "incomplete"]
PlanKey = Literal["starter", "business", "enterprise", "government"]


class BillingPlan(BaseModel):
    plan_key: PlanKey
    name: str
    seat_limit: int
    monthly_price: int
    annual_price: int
    modules_enabled: list[str]
    api_rate_limit: int
    support_tier: str
    entitlements: list[str]
    stripe_price_env_monthly: str
    stripe_price_env_annual: str


class TenantSubscription(BaseModel):
    tenant_id: str
    organization_name: str
    stripe_customer_id: str | None = None
    stripe_subscription_id: str | None = None
    plan: PlanKey
    billing_status: BillingStatus
    billing_interval: BillingInterval
    trial_ends_at: datetime | None = None
    renewal_date: datetime
    seat_limit: int
    seats_used: int
    monthly_mrr: int
    annual_value: int
    grace_period_days: int
    suspended_flag: bool
    cancel_at_period_end: bool
    payment_method_status: str
    entitlements: list[str]
    locked_modules: list[str]
    updated_at: datetime


class BillingInvoice(BaseModel):
    invoice_id: str
    tenant_id: str
    number: str
    status: Literal["draft", "open", "paid", "failed", "void"]
    amount_due: int
    amount_paid: int
    currency: str = "usd"
    hosted_invoice_url: str
    invoice_pdf: str
    created_at: datetime
    due_date: datetime | None = None
    paid_at: datetime | None = None
    failure_reason: str | None = None


class BillingMeResponse(BaseModel):
    provider: Literal["stripe", "demo"]
    publishable_key: str | None = None
    subscription: TenantSubscription
    plan: BillingPlan
    payment_recovery: dict[str, Any]
    entitlements: dict[str, bool]


class BillingPlansResponse(BaseModel):
    provider: Literal["stripe", "demo"]
    plans: list[BillingPlan]


class BillingInvoicesResponse(BaseModel):
    tenant_id: str
    invoices: list[BillingInvoice]


class BillingRevenueResponse(BaseModel):
    provider: Literal["stripe", "demo"]
    mrr: int
    arr: int
    arpu: int
    ltv: int
    active_customers: int
    trials_converting: int
    failed_payments: int
    expansion_mrr: int
    contraction_mrr: int
    churn_percent: float
    trial_conversion_percent: float
    failed_payment_rate: float
    collection_recovery_percent: int
    net_revenue_retention: int
    top_plans: list[dict[str, Any]]
    trend: list[dict[str, Any]]


class BillingUsageResponse(BaseModel):
    tenant_id: str
    seats_used: int
    seat_limit: int
    seat_utilization_percent: int
    api_calls_month: int
    api_rate_limit: int
    reports_generated: int
    ai_actions_month: int


class CheckoutRequest(BaseModel):
    plan: PlanKey
    interval: BillingInterval = "monthly"
    success_url: str | None = None
    cancel_url: str | None = None
    seats: int | None = Field(default=None, ge=1)
    promo_code: str | None = None


class CheckoutResponse(BaseModel):
    provider: Literal["stripe", "demo"]
    session_id: str
    url: str


class PortalResponse(BaseModel):
    provider: Literal["stripe", "demo"]
    url: str


class ChangePlanRequest(BaseModel):
    plan: PlanKey
    interval: BillingInterval = "monthly"


class SeatChangeRequest(BaseModel):
    seats: int = Field(..., ge=1)


class CouponRequest(BaseModel):
    coupon: str


class BillingMutationResponse(BaseModel):
    ok: bool
    message: str
    subscription: TenantSubscription | None = None
    data: dict[str, Any] = Field(default_factory=dict)


class BillingWebhookTestRequest(BaseModel):
    event_type: str = "invoice.payment_failed"
    tenant_id: str | None = None


class BillingWebhookResponse(BaseModel):
    received: bool
    event_type: str
    action: str
    subscription: TenantSubscription | None = None


class AdminTenantBillingResponse(BaseModel):
    tenants: list[TenantSubscription]


class ChurnResponse(BaseModel):
    churn_risk_percent: float
    at_risk_tenants: list[dict[str, Any]]
    recommended_actions: list[str]


class FailedPaymentsResponse(BaseModel):
    failed_count: int
    invoices: list[BillingInvoice]
    recovery_rate_percent: int
