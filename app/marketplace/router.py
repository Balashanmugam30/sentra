from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.marketplace.schemas import (
    InstalledIntegrationsResponse,
    MarketplaceAppsResponse,
    MarketplaceCategoriesResponse,
    MarketplaceConfigRequest,
    MarketplaceEcosystemResponse,
    MarketplaceMetricsResponse,
    MarketplaceMutationRequest,
    MarketplaceMutationResponse,
    MarketplaceRecommendationsResponse,
)
from app.marketplace.service import marketplace_service, marketplace_store, tenant_scope
from app.rbac.guard import get_current_identity
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/marketplace", tags=["Marketplace"])

MARKETPLACE_APP_ROLES = {"super_admin", "admin", "security_manager", "executive", "operations_commander", "security_lead"}
MARKETPLACE_ORG_ROLES = {"owner", "org_admin", "billing_admin", "executive", "ops_admin", "security_admin", "platform_admin", "procurement_admin"}


def _require_access(identity: dict[str, object], tenant: dict[str, object]) -> None:
    if str(identity.get("role")) in MARKETPLACE_APP_ROLES or str(tenant.get("org_role") or "") in MARKETPLACE_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Marketplace access required")


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    return tenant_scope(identity, tenant)


def _clear(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "marketplace:"))


def _log(request: Request, identity: dict[str, object], tenant: dict[str, object], action: str, reason: str, target_id: str | None = None) -> None:
    append_audit_event(
        category="marketplace",
        action=action,
        severity="medium",
        target_module="marketplace",
        target_id=target_id,
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=str(tenant["tenant_id"]),
        risk_score=28,
    )


def _app_id(payload: MarketplaceMutationRequest) -> str:
    if not payload.app_id:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="app_id is required")
    return payload.app_id


@router.get("/summary", response_model=MarketplaceEcosystemResponse)
def get_marketplace_summary(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> MarketplaceEcosystemResponse:
    _require_access(identity, tenant)
    return MarketplaceEcosystemResponse(
        data=cached_call(
            identity_tenant_cache_key(identity, "marketplace:summary"),
            10,
            lambda: marketplace_service.summary(_scope(identity, tenant)),
        )
    )


@router.get("/apps", response_model=MarketplaceAppsResponse)
def get_marketplace_apps(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> MarketplaceAppsResponse:
    _require_access(identity, tenant)
    apps = cached_call("marketplace:apps", 60, marketplace_store.list_apps)
    return MarketplaceAppsResponse(apps=apps, total=len(apps))


@router.get("/apps/{app_id}")
def get_marketplace_app(app_id: str, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> dict[str, object]:
    _require_access(identity, tenant)
    app = marketplace_store.get_app(app_id)
    if app is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Marketplace app not found")
    return app


@router.get("/categories", response_model=MarketplaceCategoriesResponse)
def get_marketplace_categories(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MarketplaceCategoriesResponse:
    _require_access(identity, tenant)
    return MarketplaceCategoriesResponse(categories=marketplace_store.categories())


@router.get("/featured", response_model=MarketplaceAppsResponse)
def get_marketplace_featured(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MarketplaceAppsResponse:
    _require_access(identity, tenant)
    apps = cached_call("marketplace:featured", 60, marketplace_store.featured)
    return MarketplaceAppsResponse(apps=apps, total=len(apps))


@router.get("/search", response_model=MarketplaceAppsResponse)
def get_marketplace_search(q: str = "", tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MarketplaceAppsResponse:
    _require_access(identity, tenant)
    apps = marketplace_store.search(q)
    return MarketplaceAppsResponse(apps=apps, total=len(apps))


@router.get("/installed", response_model=InstalledIntegrationsResponse)
def get_marketplace_installed(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> InstalledIntegrationsResponse:
    _require_access(identity, tenant)
    installs = cached_call(identity_tenant_cache_key(identity, "marketplace:installed"), 8, lambda: marketplace_store.list_installed(_scope(identity, tenant)))
    return InstalledIntegrationsResponse(
        installations=installs,
        active_integrations=len([item for item in installs if item["status"] == "connected" and item.get("enabled", True)]),
        monthly_addon_value=sum(int(item["billing_addon_value"]) for item in installs if item["status"] == "connected"),
    )


@router.get("/recommendations", response_model=MarketplaceRecommendationsResponse)
def get_marketplace_recommendations(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MarketplaceRecommendationsResponse:
    _require_access(identity, tenant)
    recommendations = cached_call(identity_tenant_cache_key(identity, "marketplace:recommendations"), 12, lambda: marketplace_service.recommendations(_scope(identity, tenant), tenant))
    return MarketplaceRecommendationsResponse(recommendations=recommendations)


@router.get("/metrics", response_model=MarketplaceMetricsResponse)
def get_marketplace_metrics(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MarketplaceMetricsResponse:
    _require_access(identity, tenant)
    scope = None if identity.get("role") == "super_admin" else _scope(identity, tenant)
    metrics = cached_call(identity_tenant_cache_key(identity, "marketplace:metrics"), 10, lambda: marketplace_service.metrics(scope))
    return MarketplaceMetricsResponse(**metrics)


@router.get("/vendors", response_model=MarketplaceEcosystemResponse)
def get_marketplace_vendors(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MarketplaceEcosystemResponse:
    _require_access(identity, tenant)
    return MarketplaceEcosystemResponse(data=cached_call(identity_tenant_cache_key(identity, "marketplace:vendors"), 12, lambda: marketplace_service.vendors(_scope(identity, tenant))))


@router.get("/partners", response_model=MarketplaceEcosystemResponse)
def get_marketplace_partners(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MarketplaceEcosystemResponse:
    _require_access(identity, tenant)
    return MarketplaceEcosystemResponse(data=cached_call(identity_tenant_cache_key(identity, "marketplace:partners"), 12, lambda: marketplace_service.partners(_scope(identity, tenant))))


@router.get("/revenue", response_model=MarketplaceEcosystemResponse)
def get_marketplace_revenue(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MarketplaceEcosystemResponse:
    _require_access(identity, tenant)
    return MarketplaceEcosystemResponse(data=cached_call(identity_tenant_cache_key(identity, "marketplace:revenue"), 12, lambda: marketplace_service.revenue(_scope(identity, tenant))))


@router.get("/reviews", response_model=MarketplaceEcosystemResponse)
def get_marketplace_reviews(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MarketplaceEcosystemResponse:
    _require_access(identity, tenant)
    return MarketplaceEcosystemResponse(data=cached_call(identity_tenant_cache_key(identity, "marketplace:reviews"), 12, lambda: marketplace_service.reviews(_scope(identity, tenant))))


@router.get("/security", response_model=MarketplaceEcosystemResponse)
def get_marketplace_security(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MarketplaceEcosystemResponse:
    _require_access(identity, tenant)
    return MarketplaceEcosystemResponse(data=cached_call(identity_tenant_cache_key(identity, "marketplace:security"), 12, lambda: marketplace_service.security(_scope(identity, tenant))))


@router.get("/automations", response_model=MarketplaceEcosystemResponse)
def get_marketplace_automations(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MarketplaceEcosystemResponse:
    _require_access(identity, tenant)
    return MarketplaceEcosystemResponse(data=cached_call(identity_tenant_cache_key(identity, "marketplace:automations"), 12, lambda: marketplace_service.automation_templates(_scope(identity, tenant))))


@router.post("/install", response_model=MarketplaceMutationResponse)
def post_marketplace_install(payload: MarketplaceMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MarketplaceMutationResponse:
    _require_access(identity, tenant)
    app_id = _app_id(payload)
    try:
        install = marketplace_store.install(str(tenant["tenant_id"]), app_id, str(identity.get("email") or "system"), payload.config)
    except KeyError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Marketplace app not found") from exc
    _clear(identity)
    _log(request, identity, tenant, "integration_installed", f"Installed {install['app_name']}", app_id)
    return MarketplaceMutationResponse(ok=True, message="Integration installed", installation=install)


@router.post("/uninstall", response_model=MarketplaceMutationResponse)
def post_marketplace_uninstall(payload: MarketplaceMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MarketplaceMutationResponse:
    _require_access(identity, tenant)
    app_id = _app_id(payload)
    install = marketplace_store.uninstall(_scope(identity, tenant), app_id)
    if install is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Installed app not found")
    _clear(identity)
    _log(request, identity, tenant, "integration_uninstalled", f"Uninstalled {install['app_name']}", app_id)
    return MarketplaceMutationResponse(ok=True, message="Integration uninstalled", data={"removed": install})


@router.post("/update", response_model=MarketplaceMutationResponse)
def post_marketplace_update(payload: MarketplaceMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MarketplaceMutationResponse:
    _require_access(identity, tenant)
    app_id = _app_id(payload)
    install = marketplace_store.set_status(_scope(identity, tenant), app_id, "connected", True)
    if install is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Installed app not found")
    _clear(identity)
    _log(request, identity, tenant, "integration_updated", f"Updated {install['app_name']}", app_id)
    return MarketplaceMutationResponse(ok=True, message="Integration updated", installation=install)


@router.post("/enable", response_model=MarketplaceMutationResponse)
def post_marketplace_enable(payload: MarketplaceMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MarketplaceMutationResponse:
    _require_access(identity, tenant)
    app_id = _app_id(payload)
    install = marketplace_store.set_status(_scope(identity, tenant), app_id, "connected", True)
    if install is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Installed app not found")
    _clear(identity)
    _log(request, identity, tenant, "integration_enabled", f"Enabled {install['app_name']}", app_id)
    return MarketplaceMutationResponse(ok=True, message="Integration enabled", installation=install)


@router.post("/disable", response_model=MarketplaceMutationResponse)
def post_marketplace_disable(payload: MarketplaceMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MarketplaceMutationResponse:
    _require_access(identity, tenant)
    app_id = _app_id(payload)
    install = marketplace_store.set_status(_scope(identity, tenant), app_id, "disabled", False)
    if install is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Installed app not found")
    _clear(identity)
    _log(request, identity, tenant, "integration_disabled", f"Disabled {install['app_name']}", app_id)
    return MarketplaceMutationResponse(ok=True, message="Integration disabled", installation=install)


@router.post("/test-connection", response_model=MarketplaceMutationResponse)
def post_marketplace_test_connection(payload: MarketplaceMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MarketplaceMutationResponse:
    _require_access(identity, tenant)
    app_id = _app_id(payload)
    result = marketplace_store.test_connection(_scope(identity, tenant), app_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Installed app not found")
    _clear(identity)
    _log(request, identity, tenant, "integration_tested", str(result["message"]), app_id)
    return MarketplaceMutationResponse(ok=True, message=str(result["message"]), data={"connection": result})


@router.patch("/config/{app_id}", response_model=MarketplaceMutationResponse)
def patch_marketplace_config(app_id: str, payload: MarketplaceConfigRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MarketplaceMutationResponse:
    _require_access(identity, tenant)
    install = marketplace_store.update_config(_scope(identity, tenant), app_id, payload.config)
    if install is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Installed app not found")
    _clear(identity)
    _log(request, identity, tenant, "integration_configured", f"Configured {install['app_name']}", app_id)
    return MarketplaceMutationResponse(ok=True, message="Integration configured", installation=install)


@router.post("/start-trial", response_model=MarketplaceMutationResponse)
def post_marketplace_start_trial(payload: MarketplaceMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MarketplaceMutationResponse:
    _require_access(identity, tenant)
    app_id = _app_id(payload)
    try:
        trial = marketplace_store.start_trial(str(tenant["tenant_id"]), app_id)
    except KeyError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Marketplace app not found") from exc
    _clear(identity)
    _log(request, identity, tenant, "trial_started", "Marketplace trial started", app_id)
    return MarketplaceMutationResponse(ok=True, message="Trial started", data={"trial": trial})


@router.post("/rate", response_model=MarketplaceMutationResponse)
def post_marketplace_rate(payload: MarketplaceMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MarketplaceMutationResponse:
    _require_access(identity, tenant)
    app_id = _app_id(payload)
    review = marketplace_store.add_review(str(tenant["tenant_id"]), app_id, payload.rating or 5, payload.title or "Rated by admin", payload.body or "Operational marketplace rating submitted.")
    _clear(identity)
    _log(request, identity, tenant, "review_submit", "Marketplace rating submitted", app_id)
    return MarketplaceMutationResponse(ok=True, message="Rating submitted", data={"review": review})


@router.post("/review", response_model=MarketplaceMutationResponse)
def post_marketplace_review(payload: MarketplaceMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MarketplaceMutationResponse:
    _require_access(identity, tenant)
    app_id = _app_id(payload)
    review = marketplace_store.add_review(str(tenant["tenant_id"]), app_id, payload.rating or 5, payload.title or "Enterprise review", payload.body or "Validated integration performance in Sentra operations.")
    _clear(identity)
    _log(request, identity, tenant, "review_submit", "Marketplace review submitted", app_id)
    return MarketplaceMutationResponse(ok=True, message="Review submitted", data={"review": review})


@router.post("/vendor/apply", response_model=MarketplaceMutationResponse)
def post_marketplace_vendor_apply(payload: MarketplaceMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MarketplaceMutationResponse:
    _require_access(identity, tenant)
    vendor = marketplace_store.vendor_apply(str(tenant["tenant_id"]), payload.vendor_name or payload.title or "New Marketplace Vendor")
    _clear(identity)
    _log(request, identity, tenant, "vendor_apply", "Marketplace vendor application submitted", str(vendor["vendor_id"]))
    return MarketplaceMutationResponse(ok=True, message="Vendor application submitted", data={"vendor": vendor})


@router.post("/security/approve", response_model=MarketplaceMutationResponse)
def post_marketplace_security_approve(payload: MarketplaceMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MarketplaceMutationResponse:
    _require_access(identity, tenant)
    app_id = _app_id(payload)
    approval = marketplace_store.approve_security(_scope(identity, tenant), app_id)
    if approval is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Security approval not found")
    _clear(identity)
    _log(request, identity, tenant, "security_approval", "Marketplace app security approval recorded", app_id)
    return MarketplaceMutationResponse(ok=True, message="Security approval recorded", data={"approval": approval})


@router.post("/revenue/simulate", response_model=MarketplaceMutationResponse)
def post_marketplace_revenue_simulate(payload: MarketplaceMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> MarketplaceMutationResponse:
    _require_access(identity, tenant)
    simulation = marketplace_store.simulate_revenue(_scope(identity, tenant))
    _log(request, identity, tenant, "revenue_simulated", payload.reason or "Marketplace revenue simulation generated", "marketplace-revenue")
    return MarketplaceMutationResponse(ok=True, message="Marketplace revenue simulation generated", data=simulation)
