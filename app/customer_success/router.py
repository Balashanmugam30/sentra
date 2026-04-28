from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.customer_success.schemas import (
    ChurnResponse,
    CopilotResponse,
    ExpansionResponse,
    HealthResponse,
    OnboardingResponse,
    RenewalsResponse,
    SuccessLiveResponse,
    SuccessMetricsResponse,
    SuccessMutationRequest,
    SuccessMutationResponse,
    SupportResponse,
)
from app.customer_success.service import customer_success_store, tenant_scope
from app.rbac.guard import get_current_identity
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/success", tags=["Customer Success"])

SUCCESS_APP_ROLES = {"super_admin", "admin", "security_manager", "executive", "operations_commander"}
SUCCESS_ORG_ROLES = {"owner", "org_admin", "billing_admin", "executive", "operator"}


def _require_success_access(identity: dict[str, object], tenant: dict[str, object]) -> None:
    org_role = str(tenant.get("org_role") or "")
    if str(identity.get("role")) in SUCCESS_APP_ROLES or org_role in SUCCESS_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Customer success access required")


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    scope = tenant_scope(identity, tenant)
    if not scope:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer success account unavailable")
    return scope


def _clear_success_cache(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "success:"))


def _log_success_action(
    *,
    request: Request,
    identity: dict[str, object],
    tenant: dict[str, object],
    action: str,
    reason: str,
    target_id: str | None = None,
    risk_score: int = 32,
) -> None:
    append_audit_event(
        category="customer_success",
        action=action,
        severity="medium",
        target_module="customer_success",
        target_id=target_id,
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=str(tenant["tenant_id"]),
        risk_score=risk_score,
    )


@router.get("/live", response_model=SuccessLiveResponse)
def get_success_live(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> SuccessLiveResponse:
    _require_success_access(identity, tenant)
    snapshot = cached_call(
        identity_tenant_cache_key(identity, "success:live"),
        10,
        lambda: customer_success_store.live(_scope(identity, tenant)),
    )
    return SuccessLiveResponse(**snapshot)


@router.get("/health", response_model=HealthResponse)
def get_success_health(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> HealthResponse:
    _require_success_access(identity, tenant)
    accounts = cached_call(
        identity_tenant_cache_key(identity, "success:health"),
        10,
        lambda: customer_success_store.health(_scope(identity, tenant)),
    )
    return HealthResponse(accounts=accounts)


@router.get("/churn", response_model=ChurnResponse)
def get_success_churn(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> ChurnResponse:
    _require_success_access(identity, tenant)
    predictions = cached_call(
        identity_tenant_cache_key(identity, "success:churn"),
        10,
        lambda: customer_success_store.churn(_scope(identity, tenant)),
    )
    causes: dict[str, int] = {}
    for prediction in predictions:
        for cause in prediction["top_causes"]:
            causes[cause] = causes.get(cause, 0) + 1
    return ChurnResponse(
        predictions=predictions,
        revenue_at_risk=sum(int(item["estimated_revenue_at_risk"]) for item in predictions if int(item["risk_percent"]) >= 50),
        top_causes=[cause for cause, _ in sorted(causes.items(), key=lambda item: item[1], reverse=True)[:6]],
    )


@router.get("/renewals", response_model=RenewalsResponse)
def get_success_renewals(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> RenewalsResponse:
    _require_success_access(identity, tenant)
    renewals = cached_call(
        identity_tenant_cache_key(identity, "success:renewals"),
        12,
        lambda: customer_success_store.renewals(_scope(identity, tenant)),
    )
    buckets: dict[str, int] = {}
    for renewal in renewals:
        buckets[renewal["bucket"]] = buckets.get(renewal["bucket"], 0) + 1
    return RenewalsResponse(renewals=renewals, buckets=buckets)


@router.get("/expansion", response_model=ExpansionResponse)
def get_success_expansion(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> ExpansionResponse:
    _require_success_access(identity, tenant)
    opportunities = cached_call(
        identity_tenant_cache_key(identity, "success:expansion"),
        12,
        lambda: customer_success_store.expansion(_scope(identity, tenant)),
    )
    return ExpansionResponse(
        opportunities=opportunities,
        expansion_pipeline=sum(int(item["expected_MRR_gain"]) * 12 for item in opportunities if int(item["opportunity_score"]) >= 55),
    )


@router.get("/onboarding", response_model=OnboardingResponse)
def get_success_onboarding(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> OnboardingResponse:
    _require_success_access(identity, tenant)
    return OnboardingResponse(accounts=customer_success_store.onboarding(_scope(identity, tenant)))


@router.get("/support", response_model=SupportResponse)
def get_success_support(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> SupportResponse:
    _require_success_access(identity, tenant)
    accounts = customer_success_store.support(_scope(identity, tenant))
    return SupportResponse(
        accounts=accounts,
        escalations_open=sum(int(item["priority_escalations"]) for item in accounts),
        avg_resolution_time=round(sum(float(item["avg_resolution_time"]) for item in accounts) / max(1, len(accounts)), 1),
    )


@router.get("/metrics", response_model=SuccessMetricsResponse)
def get_success_metrics(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> SuccessMetricsResponse:
    _require_success_access(identity, tenant)
    metrics = cached_call(
        identity_tenant_cache_key(identity, "success:metrics"),
        12,
        lambda: customer_success_store.metrics(_scope(identity, tenant)),
    )
    return SuccessMetricsResponse(**metrics)


@router.get("/copilot", response_model=CopilotResponse)
def get_success_copilot(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> CopilotResponse:
    _require_success_access(identity, tenant)
    actions = cached_call(
        identity_tenant_cache_key(identity, "success:copilot"),
        10,
        lambda: customer_success_store.copilot(_scope(identity, tenant)),
    )
    return CopilotResponse(actions=actions)


@router.post("/test-risk", response_model=SuccessMutationResponse)
def post_success_test_risk(
    payload: SuccessMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> SuccessMutationResponse:
    _require_success_access(identity, tenant)
    account = customer_success_store.test_risk(_scope(identity, tenant), payload.scenario, payload.tenant_id)
    _clear_success_cache(identity)
    _log_success_action(
        request=request,
        identity=identity,
        tenant=tenant,
        action="test_risk",
        reason=f"Customer risk scenario applied: {payload.scenario or 'silent_churn'}",
        target_id=account["tenant_id"],
        risk_score=56,
    )
    return SuccessMutationResponse(ok=True, message="Risk scenario applied", data={"account": account})


@router.post("/save-account", response_model=SuccessMutationResponse)
def post_success_save_account(
    payload: SuccessMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> SuccessMutationResponse:
    _require_success_access(identity, tenant)
    account = customer_success_store.save_account(_scope(identity, tenant), payload.tenant_id)
    _clear_success_cache(identity)
    _log_success_action(
        request=request,
        identity=identity,
        tenant=tenant,
        action="account_saved",
        reason=payload.note or "Customer success save motion executed",
        target_id=account["tenant_id"],
    )
    return SuccessMutationResponse(ok=True, message="Account save motion executed", data={"account": account})


@router.post("/expand-account", response_model=SuccessMutationResponse)
def post_success_expand_account(
    payload: SuccessMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> SuccessMutationResponse:
    _require_success_access(identity, tenant)
    account = customer_success_store.expand_account(_scope(identity, tenant), payload.tenant_id)
    _clear_success_cache(identity)
    _log_success_action(
        request=request,
        identity=identity,
        tenant=tenant,
        action="account_expanded",
        reason=payload.note or "Expansion motion executed",
        target_id=account["tenant_id"],
        risk_score=38,
    )
    return SuccessMutationResponse(ok=True, message="Account expansion executed", data={"account": account})


@router.post("/run-qbr", response_model=SuccessMutationResponse)
def post_success_run_qbr(
    payload: SuccessMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> SuccessMutationResponse:
    _require_success_access(identity, tenant)
    account = customer_success_store.run_qbr(_scope(identity, tenant), payload.tenant_id)
    _clear_success_cache(identity)
    _log_success_action(
        request=request,
        identity=identity,
        tenant=tenant,
        action="qbr_run",
        reason=payload.note or "Quarterly business review run",
        target_id=account["tenant_id"],
    )
    return SuccessMutationResponse(ok=True, message="QBR motion completed", data={"account": account})


@router.post("/seed-demo", response_model=SuccessMutationResponse)
def post_success_seed_demo(
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> SuccessMutationResponse:
    _require_success_access(identity, tenant)
    result = customer_success_store.seed_demo()
    _clear_success_cache(identity)
    _log_success_action(
        request=request,
        identity=identity,
        tenant=tenant,
        action="seed_demo",
        reason="Customer success demo accounts seeded",
        risk_score=24,
    )
    return SuccessMutationResponse(ok=True, message="Customer success demo data seeded", data=result)
