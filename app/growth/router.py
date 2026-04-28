from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.growth.schemas import (
    ChannelPartnersResponse,
    ContractsResponse,
    CountriesResponse,
    CustomersResponse,
    DealsResponse,
    ExpansionAiResponse,
    ForecastResponse,
    ForecastingResponse,
    FunnelAnalyticsResponse,
    GrowthLiveResponse,
    GrowthMutationRequest,
    GrowthMutationResponse,
    GrowthSummaryResponse,
    LeadsResponse,
    PipelineResponse,
    PricingResponse,
    RegionsResponse,
    RenewalsResponse,
    TerritoriesResponse,
    WhiteLabelResponse,
)
from app.growth.service import growth_store, tenant_scope
from app.rbac.guard import get_current_identity
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/growth", tags=["Growth"])

GROWTH_APP_ROLES = {"super_admin", "admin", "security_manager", "executive", "operations_commander"}
GROWTH_ORG_ROLES = {"owner", "org_admin", "billing_admin", "executive", "operator"}


def _require_access(identity: dict[str, object], tenant: dict[str, object]) -> None:
    if str(identity.get("role")) in GROWTH_APP_ROLES or str(tenant.get("org_role") or "") in GROWTH_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Growth operating system access required")


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    return tenant_scope(identity, tenant)


def _clear(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "growth:"))


def _log(request: Request, identity: dict[str, object], tenant: dict[str, object], action: str, reason: str, target_id: str | None = None) -> None:
    append_audit_event(
        category="growth",
        action=action,
        severity="medium",
        target_module="growth",
        target_id=target_id,
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=str(tenant["tenant_id"]),
        risk_score=30,
    )


@router.get("/live", response_model=GrowthLiveResponse)
def get_growth_live(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> GrowthLiveResponse:
    _require_access(identity, tenant)
    return GrowthLiveResponse(**cached_call(identity_tenant_cache_key(identity, "growth:live"), 10, lambda: growth_store.live(_scope(identity, tenant))))


@router.get("/summary", response_model=GrowthSummaryResponse)
def get_growth_gtm_summary(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> GrowthSummaryResponse:
    _require_access(identity, tenant)
    return GrowthSummaryResponse(**cached_call(identity_tenant_cache_key(identity, "growth:summary"), 10, lambda: growth_store.gtm_summary(_scope(identity, tenant))))


@router.get("/deals", response_model=DealsResponse)
def get_growth_deals(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> DealsResponse:
    _require_access(identity, tenant)
    return DealsResponse(deals=cached_call(identity_tenant_cache_key(identity, "growth:deals"), 10, lambda: growth_store.deals(_scope(identity, tenant))))


@router.post("/deal/update", response_model=GrowthMutationResponse)
def post_growth_deal_update(payload: GrowthMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> GrowthMutationResponse:
    _require_access(identity, tenant)
    deal = growth_store.update_deal(_scope(identity, tenant), payload.model_dump(exclude_none=True))
    if deal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deal not found")
    _clear(identity)
    _log(request, identity, tenant, "deal_updated", f"Deal updated: {deal['company']}", deal["deal_id"])
    return GrowthMutationResponse(ok=True, message="Deal updated", data={"deal": deal})


@router.get("/leads", response_model=LeadsResponse)
def get_growth_leads(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> LeadsResponse:
    _require_access(identity, tenant)
    return LeadsResponse(leads=cached_call(identity_tenant_cache_key(identity, "growth:leads"), 10, lambda: growth_store.leads(_scope(identity, tenant))))


@router.get("/funnel", response_model=FunnelAnalyticsResponse)
def get_growth_funnel(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> FunnelAnalyticsResponse:
    _require_access(identity, tenant)
    return FunnelAnalyticsResponse(**cached_call(identity_tenant_cache_key(identity, "growth:funnel"), 12, lambda: growth_store.funnel(_scope(identity, tenant))))


@router.get("/customers", response_model=CustomersResponse)
def get_growth_customers(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> CustomersResponse:
    _require_access(identity, tenant)
    return CustomersResponse(customers=growth_store.customers(_scope(identity, tenant)), expansions=growth_store.expansions(_scope(identity, tenant)))


@router.get("/renewals", response_model=RenewalsResponse)
def get_growth_renewals(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> RenewalsResponse:
    _require_access(identity, tenant)
    return RenewalsResponse(renewals=growth_store.renewals(_scope(identity, tenant)))


@router.post("/customer/save", response_model=GrowthMutationResponse)
def post_growth_customer_save(payload: GrowthMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> GrowthMutationResponse:
    _require_access(identity, tenant)
    customer = growth_store.save_customer(_scope(identity, tenant), payload.model_dump(exclude_none=True))
    if customer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    _clear(identity)
    _log(request, identity, tenant, "customer_save_playbook_launched", f"Save playbook launched: {customer['customer']}", customer["customer_id"])
    return GrowthMutationResponse(ok=True, message="Save playbook launched", data={"customer": customer})


@router.post("/customer/expand", response_model=GrowthMutationResponse)
def post_growth_customer_expand(payload: GrowthMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> GrowthMutationResponse:
    _require_access(identity, tenant)
    customer = growth_store.expand_customer(_scope(identity, tenant), payload.model_dump(exclude_none=True))
    if customer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    _clear(identity)
    _log(request, identity, tenant, "customer_expansion_launched", f"Expansion launched: {customer['customer']}", customer["customer_id"])
    return GrowthMutationResponse(ok=True, message="Expansion motion launched", data={"customer": customer})


@router.get("/regions", response_model=RegionsResponse)
def get_growth_regions(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> RegionsResponse:
    _require_access(identity, tenant)
    return RegionsResponse(regions=cached_call(identity_tenant_cache_key(identity, "growth:regions"), 20, lambda: growth_store.regions(_scope(identity, tenant))))


@router.get("/countries", response_model=CountriesResponse)
def get_growth_countries(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> CountriesResponse:
    _require_access(identity, tenant)
    return CountriesResponse(countries=cached_call(identity_tenant_cache_key(identity, "growth:countries"), 20, lambda: growth_store.countries(_scope(identity, tenant))))


@router.get("/territories", response_model=TerritoriesResponse)
def get_growth_territories(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> TerritoriesResponse:
    _require_access(identity, tenant)
    return TerritoriesResponse(territories=growth_store.territories(_scope(identity, tenant)))


@router.get("/channel-partners", response_model=ChannelPartnersResponse)
def get_growth_channel_partners(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ChannelPartnersResponse:
    _require_access(identity, tenant)
    return ChannelPartnersResponse(partners=growth_store.channel_partners(_scope(identity, tenant)))


@router.get("/contracts", response_model=ContractsResponse)
def get_growth_contracts(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ContractsResponse:
    _require_access(identity, tenant)
    return ContractsResponse(contracts=growth_store.contracts(_scope(identity, tenant)))


@router.get("/pricing", response_model=PricingResponse)
def get_growth_pricing(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> PricingResponse:
    _require_access(identity, tenant)
    return PricingResponse(pricing=cached_call(identity_tenant_cache_key(identity, "growth:pricing"), 20, lambda: growth_store.pricing(_scope(identity, tenant))))


@router.get("/forecast", response_model=ForecastingResponse)
def get_growth_forecast(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ForecastingResponse:
    _require_access(identity, tenant)
    scope = _scope(identity, tenant)
    return ForecastingResponse(
        forecast=cached_call(identity_tenant_cache_key(identity, "growth:forecast"), 12, lambda: growth_store.forecast(scope)),
        reps=growth_store.rep_leaderboard(scope),
    )


@router.get("/pipeline", response_model=PipelineResponse)
def get_growth_pipeline(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> PipelineResponse:
    _require_access(identity, tenant)
    return PipelineResponse(pipeline=growth_store.pipeline(_scope(identity, tenant)))


@router.get("/white-label", response_model=WhiteLabelResponse)
def get_growth_white_label(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> WhiteLabelResponse:
    _require_access(identity, tenant)
    return WhiteLabelResponse(programs=growth_store.white_labels(_scope(identity, tenant)))


@router.get("/expansion-ai", response_model=ExpansionAiResponse)
def get_growth_expansion_ai(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ExpansionAiResponse:
    _require_access(identity, tenant)
    return ExpansionAiResponse(recommendations=cached_call(identity_tenant_cache_key(identity, "growth:expansion-ai"), 12, lambda: growth_store.expansion_ai(_scope(identity, tenant))))


@router.post("/launch-country", response_model=GrowthMutationResponse)
def post_growth_launch_country(payload: GrowthMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> GrowthMutationResponse:
    _require_access(identity, tenant)
    country = growth_store.launch_country(_scope(identity, tenant), payload.country or "UAE")
    if country is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Country not found")
    _clear(identity)
    _log(request, identity, tenant, "country_launched", f"Launched {country['name']}", country["country_id"])
    return GrowthMutationResponse(ok=True, message=f"{country['name']} launched", data={"country": country})


@router.post("/open-region", response_model=GrowthMutationResponse)
def post_growth_open_region(payload: GrowthMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> GrowthMutationResponse:
    _require_access(identity, tenant)
    region = growth_store.open_region(_scope(identity, tenant), payload.region or "Middle East")
    if region is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Region not found")
    _clear(identity)
    _log(request, identity, tenant, "region_opened", f"Opened {region['name']}", region["region_id"])
    return GrowthMutationResponse(ok=True, message=f"{region['name']} region opened", data={"region": region})


@router.post("/create-enterprise-deal", response_model=GrowthMutationResponse)
def post_growth_enterprise_deal(payload: GrowthMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> GrowthMutationResponse:
    _require_access(identity, tenant)
    contract = growth_store.create_enterprise_deal(str(tenant["tenant_id"]), payload.model_dump(), government=False)
    _clear(identity)
    _log(request, identity, tenant, "enterprise_deal_created", f"Enterprise deal created: {contract['account_name']}", contract["contract_id"])
    return GrowthMutationResponse(ok=True, message="Enterprise deal created", data={"contract": contract})


@router.post("/create-government-deal", response_model=GrowthMutationResponse)
def post_growth_government_deal(payload: GrowthMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> GrowthMutationResponse:
    _require_access(identity, tenant)
    contract = growth_store.create_enterprise_deal(str(tenant["tenant_id"]), payload.model_dump(), government=True)
    _clear(identity)
    _log(request, identity, tenant, "government_deal_created", f"Government deal created: {contract['account_name']}", contract["contract_id"])
    return GrowthMutationResponse(ok=True, message="Government deal created", data={"contract": contract})


@router.post("/assign-partner", response_model=GrowthMutationResponse)
def post_growth_assign_partner(payload: GrowthMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> GrowthMutationResponse:
    _require_access(identity, tenant)
    partner = growth_store.assign_partner(_scope(identity, tenant), payload.partner_id or "", payload.country)
    if partner is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partner not found")
    _clear(identity)
    _log(request, identity, tenant, "partner_assigned", f"Partner assigned: {partner['name']}", partner["partner_id"])
    return GrowthMutationResponse(ok=True, message="Partner assigned", data={"partner": partner})


@router.post("/change-pricing", response_model=GrowthMutationResponse)
def post_growth_change_pricing(payload: GrowthMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> GrowthMutationResponse:
    _require_access(identity, tenant)
    prices = growth_store.change_pricing(_scope(identity, tenant), payload.country or "India", payload.plan or "Business", payload.percent or 8)
    if not prices:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pricing row not found")
    _clear(identity)
    _log(request, identity, tenant, "pricing_changed", f"Pricing changed for {payload.country or 'India'}", str(prices[0]["pricing_id"]))
    return GrowthMutationResponse(ok=True, message="Pricing changed", data={"pricing": prices})


@router.post("/create-franchise", response_model=GrowthMutationResponse)
def post_growth_create_franchise(payload: GrowthMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> GrowthMutationResponse:
    _require_access(identity, tenant)
    program = growth_store.create_franchise(str(tenant["tenant_id"]), payload.model_dump())
    _clear(identity)
    _log(request, identity, tenant, "white_label_created", f"White-label created: {program['name']}", program["franchise_id"])
    return GrowthMutationResponse(ok=True, message="White-label franchise created", data={"program": program})


@router.post("/run-expansion-simulation", response_model=GrowthMutationResponse)
def post_growth_run_simulation(payload: GrowthMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> GrowthMutationResponse:
    _require_access(identity, tenant)
    simulation = growth_store.run_expansion_simulation(_scope(identity, tenant), payload.scenario)
    _clear(identity)
    _log(request, identity, tenant, "simulation_run", f"Expansion simulation run: {simulation['scenario']}", simulation["scenario"])
    return GrowthMutationResponse(ok=True, message="Expansion simulation complete", data={"simulation": simulation})


@router.post("/seed-demo", response_model=GrowthMutationResponse)
def post_growth_seed_demo(request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> GrowthMutationResponse:
    _require_access(identity, tenant)
    result = growth_store.seed_demo()
    _clear(identity)
    _log(request, identity, tenant, "seed_demo", "Growth demo data seeded")
    return GrowthMutationResponse(ok=True, message="Growth demo data seeded", data=result)
