from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.billing.analytics import build_churn_intelligence, build_failed_payment_recovery, build_revenue_analytics
from app.billing.schemas import (
    AdminTenantBillingResponse,
    BillingInvoicesResponse,
    BillingMeResponse,
    BillingMutationResponse,
    BillingPlansResponse,
    BillingRevenueResponse,
    BillingUsageResponse,
    BillingWebhookResponse,
    BillingWebhookTestRequest,
    ChangePlanRequest,
    CheckoutRequest,
    CheckoutResponse,
    ChurnResponse,
    CouponRequest,
    FailedPaymentsResponse,
    PortalResponse,
    SeatChangeRequest,
    TenantSubscription,
)
from app.billing.service import (
    billing_me,
    billing_plans,
    billing_store,
    create_checkout,
    provider,
    stripe_gateway,
    subscription_for_tenant,
    usage_snapshot,
)
from app.billing.webhooks import parse_stripe_webhook, sync_webhook_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.rbac.guard import get_current_identity
from app.rbac.permissions import role_matches
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/billing", tags=["Billing"])


def _require_billing_access(identity: dict[str, object], tenant: dict[str, object]) -> None:
    org_role = str(tenant.get("org_role") or "")
    if role_matches(str(identity.get("role") or ""), {"super_admin", "admin"}) or org_role in {
        "owner",
        "billing_admin",
        "org_admin",
    }:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Billing admin access required")


def _require_platform_billing(identity: dict[str, object]) -> None:
    if not role_matches(str(identity.get("role") or ""), {"super_admin"}):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Platform billing access required")


def _log_billing_action(
    *,
    request: Request,
    identity: dict[str, object],
    action: str,
    reason: str,
    target_id: str | None = None,
    risk_score: int = 28,
) -> None:
    append_audit_event(
        category="billing",
        action=action,
        severity="medium",
        target_module="billing",
        target_id=target_id,
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        risk_score=risk_score,
    )


@router.get("/plans", response_model=BillingPlansResponse)
def get_billing_plans() -> BillingPlansResponse:
    return BillingPlansResponse(provider=provider(), plans=billing_plans())


@router.get("/me", response_model=BillingMeResponse)
def get_billing_me(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> BillingMeResponse:
    _require_billing_access(identity, tenant)
    return BillingMeResponse(**billing_me(tenant))


@router.get("/subscription", response_model=TenantSubscription)
def get_billing_subscription(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> TenantSubscription:
    _require_billing_access(identity, tenant)
    return TenantSubscription(**subscription_for_tenant(tenant))


@router.get("/invoices", response_model=BillingInvoicesResponse)
def get_billing_invoices(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> BillingInvoicesResponse:
    _require_billing_access(identity, tenant)
    tenant_id = str(tenant["tenant_id"])
    return BillingInvoicesResponse(tenant_id=tenant_id, invoices=billing_store.list_invoices(tenant_id))


@router.get("/revenue", response_model=BillingRevenueResponse)
def get_billing_revenue(
    identity: dict[str, object] = Depends(get_current_identity),
) -> BillingRevenueResponse:
    if not role_matches(str(identity.get("role") or ""), {"super_admin", "admin", "executive"}):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Revenue summary access required")
    snapshot = cached_call(identity_tenant_cache_key(identity, "billing:revenue"), 10, build_revenue_analytics)
    return BillingRevenueResponse(**snapshot)


@router.get("/usage", response_model=BillingUsageResponse)
def get_billing_usage(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> BillingUsageResponse:
    _require_billing_access(identity, tenant)
    return BillingUsageResponse(**usage_snapshot(tenant))


@router.post("/create-checkout", response_model=CheckoutResponse)
def post_create_checkout(
    payload: CheckoutRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> CheckoutResponse:
    _require_billing_access(identity, tenant)
    result = create_checkout(tenant, payload.model_dump())
    _log_billing_action(
        request=request,
        identity=identity,
        action="checkout_created",
        reason=f"Checkout created for {payload.plan}",
        target_id=str(tenant["tenant_id"]),
    )
    return CheckoutResponse(**result)


@router.post("/create-portal", response_model=PortalResponse)
def post_create_portal(
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> PortalResponse:
    _require_billing_access(identity, tenant)
    subscription = subscription_for_tenant(tenant)
    url = stripe_gateway.create_portal_url(
        customer_id=subscription.get("stripe_customer_id"),
        tenant_id=str(tenant["tenant_id"]),
    )
    _log_billing_action(
        request=request,
        identity=identity,
        action="portal_opened",
        reason="Billing portal session created",
        target_id=str(tenant["tenant_id"]),
    )
    return PortalResponse(provider=provider(), url=url)


@router.post("/change-plan", response_model=BillingMutationResponse)
def post_change_plan(
    payload: ChangePlanRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> BillingMutationResponse:
    _require_billing_access(identity, tenant)
    subscription = billing_store.change_plan(
        tenant_id=str(tenant["tenant_id"]),
        plan_key=payload.plan,
        interval=payload.interval,
    )
    clear_runtime_cache(identity_tenant_cache_key(identity, "billing:"))
    _log_billing_action(
        request=request,
        identity=identity,
        action="plan_changed",
        reason=f"Plan changed to {payload.plan}/{payload.interval}",
        target_id=str(tenant["tenant_id"]),
        risk_score=44,
    )
    return BillingMutationResponse(ok=True, message="Plan updated", subscription=TenantSubscription(**subscription))


@router.post("/cancel", response_model=BillingMutationResponse)
def post_cancel_subscription(
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> BillingMutationResponse:
    _require_billing_access(identity, tenant)
    subscription = billing_store.cancel(str(tenant["tenant_id"]))
    _log_billing_action(
        request=request,
        identity=identity,
        action="subscription_cancelled",
        reason="Subscription marked cancel-at-period-end",
        target_id=str(tenant["tenant_id"]),
        risk_score=62,
    )
    return BillingMutationResponse(ok=True, message="Cancellation scheduled", subscription=TenantSubscription(**subscription))


@router.post("/reactivate", response_model=BillingMutationResponse)
def post_reactivate_subscription(
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> BillingMutationResponse:
    _require_billing_access(identity, tenant)
    subscription = billing_store.reactivate(str(tenant["tenant_id"]))
    _log_billing_action(
        request=request,
        identity=identity,
        action="subscription_reactivated",
        reason="Subscription reactivated",
        target_id=str(tenant["tenant_id"]),
    )
    return BillingMutationResponse(ok=True, message="Subscription reactivated", subscription=TenantSubscription(**subscription))


@router.post("/add-seats", response_model=BillingMutationResponse)
def post_add_seats(
    payload: SeatChangeRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> BillingMutationResponse:
    _require_billing_access(identity, tenant)
    subscription = billing_store.update_seats(tenant_id=str(tenant["tenant_id"]), delta=payload.seats)
    _log_billing_action(
        request=request,
        identity=identity,
        action="seat_added",
        reason=f"Added {payload.seats} seats",
        target_id=str(tenant["tenant_id"]),
    )
    return BillingMutationResponse(ok=True, message="Seats added", subscription=TenantSubscription(**subscription))


@router.post("/apply-coupon", response_model=BillingMutationResponse)
def post_apply_coupon(
    payload: CouponRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> BillingMutationResponse:
    _require_billing_access(identity, tenant)
    subscription = billing_store.apply_coupon(str(tenant["tenant_id"]), payload.coupon)
    _log_billing_action(
        request=request,
        identity=identity,
        action="coupon_applied",
        reason=f"Coupon applied: {payload.coupon}",
        target_id=str(tenant["tenant_id"]),
    )
    return BillingMutationResponse(ok=True, message="Coupon applied", subscription=TenantSubscription(**subscription))


@router.post("/webhook", response_model=BillingWebhookResponse)
async def post_stripe_webhook(request: Request) -> BillingWebhookResponse:
    event = await parse_stripe_webhook(request)
    event_type, subscription = sync_webhook_event(event)
    return BillingWebhookResponse(
        received=True,
        event_type=event_type,
        action="synced",
        subscription=TenantSubscription(**subscription),
    )


@router.post("/test-webhook", response_model=BillingWebhookResponse)
def post_billing_test_webhook(
    payload: BillingWebhookTestRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> BillingWebhookResponse:
    _require_billing_access(identity, tenant)
    tenant_id = payload.tenant_id or str(tenant["tenant_id"])
    subscription = billing_store.record_webhook(payload.event_type, tenant_id)
    _log_billing_action(
        request=request,
        identity=identity,
        action=payload.event_type.replace(".", "_"),
        reason=f"Billing webhook simulated: {payload.event_type}",
        target_id=tenant_id,
    )
    return BillingWebhookResponse(
        received=True,
        event_type=payload.event_type,
        action="synced",
        subscription=TenantSubscription(**subscription),
    )


@router.get("/admin/tenants", response_model=AdminTenantBillingResponse)
def get_admin_billing_tenants(
    identity: dict[str, object] = Depends(get_current_identity),
) -> AdminTenantBillingResponse:
    _require_platform_billing(identity)
    return AdminTenantBillingResponse(tenants=billing_store.list_subscriptions())


@router.get("/admin/revenue", response_model=BillingRevenueResponse)
def get_admin_revenue(
    identity: dict[str, object] = Depends(get_current_identity),
) -> BillingRevenueResponse:
    _require_platform_billing(identity)
    return BillingRevenueResponse(**build_revenue_analytics())


@router.get("/admin/churn", response_model=ChurnResponse)
def get_admin_churn(
    identity: dict[str, object] = Depends(get_current_identity),
) -> ChurnResponse:
    _require_platform_billing(identity)
    return ChurnResponse(**build_churn_intelligence())


@router.get("/admin/failed-payments", response_model=FailedPaymentsResponse)
def get_admin_failed_payments(
    identity: dict[str, object] = Depends(get_current_identity),
) -> FailedPaymentsResponse:
    _require_platform_billing(identity)
    return FailedPaymentsResponse(**build_failed_payment_recovery())
