from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.ecosystem.schemas import (
    ApiUsageResponse,
    CertificationsResponse,
    DevelopersResponse,
    EcosystemLiveResponse,
    EcosystemMutationRequest,
    EcosystemMutationResponse,
    ExpansionAiResponse,
    IntegrationsResponse,
    MarketplaceResponse,
    NetworkEffectsResponse,
    PartnersResponse,
    WebhooksResponse,
)
from app.ecosystem.service import ecosystem_store, tenant_scope
from app.rbac.guard import get_current_identity
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/ecosystem", tags=["Ecosystem"])

ECOSYSTEM_APP_ROLES = {"super_admin", "admin", "security_manager", "executive", "operations_commander", "security_lead"}
ECOSYSTEM_ORG_ROLES = {"owner", "org_admin", "billing_admin", "executive", "ops_admin", "security_admin"}


def _require_access(identity: dict[str, object], tenant: dict[str, object]) -> None:
    if str(identity.get("role")) in ECOSYSTEM_APP_ROLES or str(tenant.get("org_role") or "") in ECOSYSTEM_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Ecosystem access required")


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    return tenant_scope(identity, tenant)


def _tenant_id(tenant: dict[str, object]) -> str:
    return str(tenant["tenant_id"])


def _clear(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "ecosystem:"))


def _log(request: Request, identity: dict[str, object], tenant: dict[str, object], action: str, reason: str, target_id: str | None = None) -> None:
    append_audit_event(
        category="ecosystem",
        action=action,
        severity="medium",
        target_module="ecosystem",
        target_id=target_id,
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=_tenant_id(tenant),
        risk_score=34,
    )


@router.get("/live", response_model=EcosystemLiveResponse)
def get_ecosystem_live(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> EcosystemLiveResponse:
    _require_access(identity, tenant)
    return EcosystemLiveResponse(
        **cached_call(
            identity_tenant_cache_key(identity, "ecosystem:live"),
            10,
            lambda: ecosystem_store.live(_scope(identity, tenant)),
        )
    )


@router.get("/marketplace", response_model=MarketplaceResponse)
def get_ecosystem_marketplace(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> MarketplaceResponse:
    _require_access(identity, tenant)
    return MarketplaceResponse(
        **cached_call(
            identity_tenant_cache_key(identity, "ecosystem:marketplace"),
            18,
            lambda: ecosystem_store.marketplace(_scope(identity, tenant)),
        )
    )


@router.get("/integrations", response_model=IntegrationsResponse)
def get_ecosystem_integrations(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> IntegrationsResponse:
    _require_access(identity, tenant)
    return IntegrationsResponse(integrations=ecosystem_store.integrations(_scope(identity, tenant)))


@router.get("/developers", response_model=DevelopersResponse)
def get_ecosystem_developers(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> DevelopersResponse:
    _require_access(identity, tenant)
    return DevelopersResponse(**ecosystem_store.developers(_scope(identity, tenant)))


@router.get("/api-usage", response_model=ApiUsageResponse)
def get_ecosystem_api_usage(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> ApiUsageResponse:
    _require_access(identity, tenant)
    return ApiUsageResponse(usage=ecosystem_store.api_usage(_scope(identity, tenant)))


@router.get("/webhooks", response_model=WebhooksResponse)
def get_ecosystem_webhooks(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> WebhooksResponse:
    _require_access(identity, tenant)
    return WebhooksResponse(webhooks=ecosystem_store.webhooks(_scope(identity, tenant)))


@router.get("/partners", response_model=PartnersResponse)
def get_ecosystem_partners(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> PartnersResponse:
    _require_access(identity, tenant)
    return PartnersResponse(partners=ecosystem_store.partners(_scope(identity, tenant)))


@router.get("/certifications", response_model=CertificationsResponse)
def get_ecosystem_certifications(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> CertificationsResponse:
    _require_access(identity, tenant)
    return CertificationsResponse(certifications=ecosystem_store.certifications(_scope(identity, tenant)))


@router.get("/network-effects", response_model=NetworkEffectsResponse)
def get_ecosystem_network_effects(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> NetworkEffectsResponse:
    _require_access(identity, tenant)
    return NetworkEffectsResponse(network_effects=ecosystem_store.network_effects(_scope(identity, tenant)))


@router.get("/expansion-ai", response_model=ExpansionAiResponse)
def get_ecosystem_expansion_ai(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> ExpansionAiResponse:
    _require_access(identity, tenant)
    return ExpansionAiResponse(recommendations=ecosystem_store.expansion_ai())


@router.post("/create-api-key", response_model=EcosystemMutationResponse)
def post_ecosystem_create_api_key(
    payload: EcosystemMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> EcosystemMutationResponse:
    _require_access(identity, tenant)
    key = ecosystem_store.create_api_key(_tenant_id(tenant), payload.label)
    _clear(identity)
    _log(request, identity, tenant, "api_key_created", f"Ecosystem API key created: {key['label']}", str(key["key_id"]))
    return EcosystemMutationResponse(ok=True, message="API key created", data={"key": key})


@router.post("/install-app", response_model=EcosystemMutationResponse)
def post_ecosystem_install_app(
    payload: EcosystemMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> EcosystemMutationResponse:
    _require_access(identity, tenant)
    install = ecosystem_store.install_app(_tenant_id(tenant), payload.app_id or "servicenow", str(identity.get("email") or "system"))
    _clear(identity)
    _log(request, identity, tenant, "app_installed", f"Ecosystem app installed: {install['name']}", str(install["app_id"]))
    return EcosystemMutationResponse(ok=True, message="App installed", data={"app": install})


@router.post("/launch-partner", response_model=EcosystemMutationResponse)
def post_ecosystem_launch_partner(
    payload: EcosystemMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> EcosystemMutationResponse:
    _require_access(identity, tenant)
    partner = ecosystem_store.launch_partner(_tenant_id(tenant), payload.partner_type)
    _clear(identity)
    _log(request, identity, tenant, "partner_launched", f"Ecosystem partner launched: {partner['name']}", str(partner["partner_id"]))
    return EcosystemMutationResponse(ok=True, message="Partner launched", data={"partner": partner})


@router.post("/run-ecosystem-sim", response_model=EcosystemMutationResponse)
def post_ecosystem_simulation(
    payload: EcosystemMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> EcosystemMutationResponse:
    _require_access(identity, tenant)
    simulation = ecosystem_store.run_simulation(_tenant_id(tenant), payload.scenario)
    _clear(identity)
    _log(request, identity, tenant, "simulation_run", f"Ecosystem simulation run: {simulation['scenario']}", str(simulation["simulation_id"]))
    return EcosystemMutationResponse(ok=True, message="Ecosystem simulation complete", data=simulation)


@router.post("/issue-certification", response_model=EcosystemMutationResponse)
def post_ecosystem_certification(
    payload: EcosystemMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> EcosystemMutationResponse:
    _require_access(identity, tenant)
    certification = ecosystem_store.issue_certification(_tenant_id(tenant), payload.track)
    _clear(identity)
    _log(request, identity, tenant, "certification_issued", f"Certification issued: {certification['track']}", str(certification["credential_id"]))
    return EcosystemMutationResponse(ok=True, message="Certification issued", data={"certification": certification})
