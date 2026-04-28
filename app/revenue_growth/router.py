from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.rbac.guard import get_current_identity
from app.revenue_growth.schemas import (
    AuthorityResponse,
    ConversionResponse,
    FunnelResponse,
    LeadSourcesResponse,
    PricingResponse,
    ReferralsResponse,
    RevenueGrowthLiveResponse,
    RevenueGrowthMutationRequest,
    RevenueGrowthMutationResponse,
    SalesAiResponse,
    ViralResponse,
    WaitlistResponse,
)
from app.revenue_growth.service import revenue_growth_store, tenant_scope
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/revenue-growth", tags=["Revenue Growth"])

REVENUE_GROWTH_APP_ROLES = {"super_admin", "admin", "security_manager", "executive", "operations_commander"}
REVENUE_GROWTH_ORG_ROLES = {"owner", "org_admin", "billing_admin", "executive", "operator"}


def _require_access(identity: dict[str, object], tenant: dict[str, object]) -> None:
    org_role = str(tenant.get("org_role") or "")
    if str(identity.get("role")) in REVENUE_GROWTH_APP_ROLES or org_role in REVENUE_GROWTH_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Revenue growth access required")


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    return tenant_scope(identity, tenant)


def _tenant_id(tenant: dict[str, object]) -> str:
    return str(tenant["tenant_id"])


def _clear(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "revenue-growth:"))


def _log(
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
        category="revenue_growth",
        action=action,
        severity="medium",
        target_module="revenue_growth",
        target_id=target_id,
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=_tenant_id(tenant),
        risk_score=risk_score,
    )


@router.get("/live", response_model=RevenueGrowthLiveResponse)
def get_revenue_growth_live(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> RevenueGrowthLiveResponse:
    _require_access(identity, tenant)
    return RevenueGrowthLiveResponse(
        **cached_call(
            identity_tenant_cache_key(identity, "revenue-growth:live"),
            10,
            lambda: revenue_growth_store.live(_scope(identity, tenant)),
        )
    )


@router.get("/funnel", response_model=FunnelResponse)
def get_revenue_growth_funnel(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> FunnelResponse:
    _require_access(identity, tenant)
    return FunnelResponse(
        funnel=cached_call(
            identity_tenant_cache_key(identity, "revenue-growth:funnel"),
            12,
            lambda: revenue_growth_store.funnel(_scope(identity, tenant)),
        )
    )


@router.get("/lead-sources", response_model=LeadSourcesResponse)
def get_revenue_growth_lead_sources(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> LeadSourcesResponse:
    _require_access(identity, tenant)
    return LeadSourcesResponse(
        sources=cached_call(
            identity_tenant_cache_key(identity, "revenue-growth:lead-sources"),
            18,
            lambda: revenue_growth_store.lead_sources(_scope(identity, tenant)),
        )
    )


@router.get("/conversion", response_model=ConversionResponse)
def get_revenue_growth_conversion(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> ConversionResponse:
    _require_access(identity, tenant)
    return ConversionResponse(
        **cached_call(
            identity_tenant_cache_key(identity, "revenue-growth:conversion"),
            12,
            lambda: revenue_growth_store.conversion(_scope(identity, tenant)),
        )
    )


@router.get("/referrals", response_model=ReferralsResponse)
def get_revenue_growth_referrals(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> ReferralsResponse:
    _require_access(identity, tenant)
    return ReferralsResponse(
        programs=cached_call(
            identity_tenant_cache_key(identity, "revenue-growth:referrals"),
            18,
            lambda: revenue_growth_store.referrals(_scope(identity, tenant)),
        )
    )


@router.get("/viral", response_model=ViralResponse)
def get_revenue_growth_viral(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> ViralResponse:
    _require_access(identity, tenant)
    return ViralResponse(
        viral=cached_call(
            identity_tenant_cache_key(identity, "revenue-growth:viral"),
            18,
            lambda: revenue_growth_store.viral(_scope(identity, tenant)),
        )
    )


@router.get("/pricing", response_model=PricingResponse)
def get_revenue_growth_pricing(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> PricingResponse:
    _require_access(identity, tenant)
    experiments = cached_call(
        identity_tenant_cache_key(identity, "revenue-growth:pricing"),
        20,
        lambda: revenue_growth_store.pricing(_scope(identity, tenant)),
    )
    return PricingResponse(experiments=experiments, best_variant=experiments[0])


@router.get("/sales-ai", response_model=SalesAiResponse)
def get_revenue_growth_sales_ai(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> SalesAiResponse:
    _require_access(identity, tenant)
    return SalesAiResponse(
        actions=cached_call(
            identity_tenant_cache_key(identity, "revenue-growth:sales-ai"),
            12,
            lambda: revenue_growth_store.sales_ai(_scope(identity, tenant)),
        )
    )


@router.get("/waitlist", response_model=WaitlistResponse)
def get_revenue_growth_waitlist(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> WaitlistResponse:
    _require_access(identity, tenant)
    return WaitlistResponse(waitlist=revenue_growth_store.waitlist(_scope(identity, tenant)))


@router.get("/authority", response_model=AuthorityResponse)
def get_revenue_growth_authority(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> AuthorityResponse:
    _require_access(identity, tenant)
    return AuthorityResponse(**revenue_growth_store.authority(_scope(identity, tenant)))


@router.post("/run-pricing-test", response_model=RevenueGrowthMutationResponse)
def post_revenue_growth_pricing_test(
    payload: RevenueGrowthMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> RevenueGrowthMutationResponse:
    _require_access(identity, tenant)
    result = revenue_growth_store.run_pricing_test(_tenant_id(tenant), payload.variant)
    _clear(identity)
    _log(request=request, identity=identity, tenant=tenant, action="pricing_test_launched", reason="Revenue pricing test launched", target_id=str(result["winner"]["experiment_id"]))
    return RevenueGrowthMutationResponse(ok=True, message="Pricing test launched", data=result)


@router.post("/create-lead", response_model=RevenueGrowthMutationResponse)
def post_revenue_growth_create_lead(
    payload: RevenueGrowthMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> RevenueGrowthMutationResponse:
    _require_access(identity, tenant)
    lead = revenue_growth_store.create_lead(_tenant_id(tenant), payload.model_dump(exclude_none=True))
    _clear(identity)
    _log(request=request, identity=identity, tenant=tenant, action="lead_created", reason=f"Growth lead created for {lead['company_name']}", target_id=str(lead["lead_id"]))
    return RevenueGrowthMutationResponse(ok=True, message="Lead created", data={"lead": lead})


@router.post("/launch-referral-campaign", response_model=RevenueGrowthMutationResponse)
def post_revenue_growth_referral_campaign(
    payload: RevenueGrowthMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> RevenueGrowthMutationResponse:
    _require_access(identity, tenant)
    campaign = revenue_growth_store.launch_referral_campaign(_scope(identity, tenant), payload.campaign)
    _clear(identity)
    _log(request=request, identity=identity, tenant=tenant, action="campaign_started", reason=f"Referral campaign started: {campaign['campaign']}", target_id=str(campaign["campaign"]))
    return RevenueGrowthMutationResponse(ok=True, message="Referral campaign launched", data=campaign)


@router.post("/run-growth-simulation", response_model=RevenueGrowthMutationResponse)
def post_revenue_growth_simulation(
    payload: RevenueGrowthMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> RevenueGrowthMutationResponse:
    _require_access(identity, tenant)
    simulation = revenue_growth_store.run_growth_simulation(_scope(identity, tenant), payload.scenario)
    _clear(identity)
    _log(request=request, identity=identity, tenant=tenant, action="simulation_run", reason=f"Growth simulation run: {simulation['scenario']}", target_id=str(simulation["scenario"]))
    return RevenueGrowthMutationResponse(ok=True, message="Growth simulation complete", data=simulation)
