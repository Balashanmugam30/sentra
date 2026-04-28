from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.rbac.guard import get_current_identity
from app.rbac.permissions import role_matches
from app.revenue.schemas import (
    RevenueAlertsResponse,
    RevenueBillingSnapshot,
    RevenueCustomersResponse,
    RevenueForecastResponse,
    RevenueInvoicesResponse,
    RevenueMutationRequest,
    RevenueMutationResponse,
    RevenuePlansResponse,
    RevenueSubscription,
    RevenueSummary,
    RevenueUsageResponse,
)
from app.revenue.service import (
    add_seats,
    billing_snapshot,
    cancel_subscription,
    downgrade_subscription,
    finance_alerts,
    invoice_ledger,
    pay_invoice,
    reactivate_subscription,
    remove_seats,
    revenue_forecast,
    revenue_store,
    revenue_summary,
    top_customers,
    upgrade_subscription,
    usage_snapshot,
)
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/revenue", tags=["Revenue Core"])

REVENUE_APP_ROLES = {"super_admin", "admin", "executive", "finance"}
REVENUE_ORG_ROLES = {"owner", "org_admin", "billing_admin", "finance_admin"}


def _require_revenue_access(identity: dict[str, object], tenant: dict[str, object]) -> None:
    org_role = str(tenant.get("org_role") or "")
    if role_matches(str(identity.get("role") or ""), REVENUE_APP_ROLES) or org_role in REVENUE_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Revenue admin access required")


def _cache_key(identity: dict[str, object], key: str) -> str:
    return identity_tenant_cache_key(identity, f"revenue:{key}")


def _clear(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "revenue:"))


def _log(
    *,
    request: Request,
    identity: dict[str, object],
    tenant: dict[str, object],
    action: str,
    reason: str,
    target_id: str | None = None,
    risk_score: int = 38,
) -> None:
    append_audit_event(
        category="revenue",
        action=action,
        severity="medium",
        target_module="revenue",
        target_id=target_id,
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=str(tenant["tenant_id"]),
        risk_score=risk_score,
    )


@router.get("/billing", response_model=RevenueBillingSnapshot)
def get_revenue_billing(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> RevenueBillingSnapshot:
    _require_revenue_access(identity, tenant)
    return RevenueBillingSnapshot(
        **cached_call(_cache_key(identity, "billing"), 8, lambda: billing_snapshot(tenant))
    )


@router.get("/summary", response_model=RevenueSummary)
def get_revenue_summary(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> RevenueSummary:
    _require_revenue_access(identity, tenant)
    return RevenueSummary(**cached_call(_cache_key(identity, "summary"), 10, revenue_summary))


@router.get("/plans", response_model=RevenuePlansResponse)
def get_revenue_plans(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> RevenuePlansResponse:
    _require_revenue_access(identity, tenant)
    return RevenuePlansResponse(plans=revenue_store.plans())


@router.get("/subscription", response_model=RevenueSubscription)
def get_revenue_subscription(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> RevenueSubscription:
    _require_revenue_access(identity, tenant)
    return RevenueSubscription(**revenue_store.current_subscription(tenant))


@router.post("/upgrade", response_model=RevenueMutationResponse)
def post_revenue_upgrade(
    payload: RevenueMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> RevenueMutationResponse:
    _require_revenue_access(identity, tenant)
    if not payload.plan_key:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="plan_key required")
    message, subscription, data = upgrade_subscription(tenant, payload.plan_key, payload.interval or "annual")
    _clear(identity)
    _log(request=request, identity=identity, tenant=tenant, action="plan_changed", reason=f"Upgrade requested to {payload.plan_key}", target_id=payload.plan_key, risk_score=52)
    return RevenueMutationResponse(ok=True, message=message, subscription=RevenueSubscription(**subscription), data=data)


@router.post("/downgrade", response_model=RevenueMutationResponse)
def post_revenue_downgrade(
    payload: RevenueMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> RevenueMutationResponse:
    _require_revenue_access(identity, tenant)
    if not payload.plan_key:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="plan_key required")
    try:
        message, subscription, data = downgrade_subscription(tenant, payload.plan_key, payload.interval or "monthly")
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    _clear(identity)
    _log(request=request, identity=identity, tenant=tenant, action="plan_changed", reason=f"Downgrade requested to {payload.plan_key}", target_id=payload.plan_key, risk_score=68)
    return RevenueMutationResponse(ok=True, message=message, subscription=RevenueSubscription(**subscription), data=data)


@router.post("/cancel", response_model=RevenueMutationResponse)
def post_revenue_cancel(
    payload: RevenueMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> RevenueMutationResponse:
    _require_revenue_access(identity, tenant)
    subscription = cancel_subscription(tenant, immediate=payload.reason == "immediate")
    _clear(identity)
    _log(request=request, identity=identity, tenant=tenant, action="subscription_cancelled", reason=payload.reason or "Cancel at renewal", target_id=str(tenant["tenant_id"]), risk_score=74)
    return RevenueMutationResponse(ok=True, message="Cancellation scheduled", subscription=RevenueSubscription(**subscription))


@router.post("/reactivate", response_model=RevenueMutationResponse)
def post_revenue_reactivate(
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> RevenueMutationResponse:
    _require_revenue_access(identity, tenant)
    subscription = reactivate_subscription(tenant)
    _clear(identity)
    _log(request=request, identity=identity, tenant=tenant, action="subscription_reactivated", reason="Subscription reactivated", target_id=str(tenant["tenant_id"]))
    return RevenueMutationResponse(ok=True, message="Subscription reactivated", subscription=RevenueSubscription(**subscription))


@router.post("/seats/add", response_model=RevenueMutationResponse)
def post_revenue_add_seats(
    payload: RevenueMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> RevenueMutationResponse:
    _require_revenue_access(identity, tenant)
    subscription = add_seats(tenant, payload.seats or 5)
    _clear(identity)
    _log(request=request, identity=identity, tenant=tenant, action="seat_changed", reason=f"Added {payload.seats or 5} seats", target_id=str(tenant["tenant_id"]))
    return RevenueMutationResponse(ok=True, message="Seats added", subscription=RevenueSubscription(**subscription))


@router.post("/seats/remove", response_model=RevenueMutationResponse)
def post_revenue_remove_seats(
    payload: RevenueMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> RevenueMutationResponse:
    _require_revenue_access(identity, tenant)
    subscription = remove_seats(tenant, payload.seats or 5)
    _clear(identity)
    _log(request=request, identity=identity, tenant=tenant, action="seat_changed", reason=f"Removed {payload.seats or 5} seats", target_id=str(tenant["tenant_id"]))
    return RevenueMutationResponse(ok=True, message="Seats removed", subscription=RevenueSubscription(**subscription))


@router.get("/invoices", response_model=RevenueInvoicesResponse)
def get_revenue_invoices(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> RevenueInvoicesResponse:
    _require_revenue_access(identity, tenant)
    return RevenueInvoicesResponse(invoices=invoice_ledger(tenant))


@router.post("/invoice/pay", response_model=RevenueMutationResponse)
def post_revenue_invoice_pay(
    payload: RevenueMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> RevenueMutationResponse:
    _require_revenue_access(identity, tenant)
    if not payload.invoice_id:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="invoice_id required")
    invoice = pay_invoice(payload.invoice_id)
    _clear(identity)
    _log(request=request, identity=identity, tenant=tenant, action="manual_invoice_action", reason=f"Invoice marked paid: {payload.invoice_id}", target_id=payload.invoice_id, risk_score=58)
    return RevenueMutationResponse(ok=True, message="Invoice marked paid", data={"invoice": invoice})


@router.get("/usage", response_model=RevenueUsageResponse)
def get_revenue_usage(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> RevenueUsageResponse:
    _require_revenue_access(identity, tenant)
    return RevenueUsageResponse(usage=usage_snapshot(tenant))


@router.get("/forecast", response_model=RevenueForecastResponse)
def get_revenue_forecast(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> RevenueForecastResponse:
    _require_revenue_access(identity, tenant)
    return RevenueForecastResponse(forecast=cached_call(_cache_key(identity, "forecast"), 18, revenue_forecast))


@router.get("/alerts", response_model=RevenueAlertsResponse)
def get_revenue_alerts(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> RevenueAlertsResponse:
    _require_revenue_access(identity, tenant)
    return RevenueAlertsResponse(alerts=finance_alerts())


@router.get("/customers", response_model=RevenueCustomersResponse)
def get_revenue_customers(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> RevenueCustomersResponse:
    _require_revenue_access(identity, tenant)
    return RevenueCustomersResponse(customers=top_customers())

