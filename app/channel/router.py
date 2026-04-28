from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.channel.schemas import ChannelMutationRequest, ChannelMutationResponse, ChannelResponse
from app.channel.service import channel_service
from app.channel.store import channel_store
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.ml.store import DEMO_TENANTS, tenant_scope
from app.rbac.guard import get_current_identity
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/channel", tags=["White Label Partner Expansion OS"])

CHANNEL_APP_ROLES = {"super_admin", "admin"}
CHANNEL_ORG_ROLES = {"owner", "platform_admin", "global_admin", "channel_admin"}


def _require_access(identity: dict[str, object], tenant: dict[str, object]) -> None:
    if str(identity.get("role")) in CHANNEL_APP_ROLES or str(tenant.get("org_role") or "") in CHANNEL_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Channel expansion access required")


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    if str(identity.get("role")) in {"super_admin", "admin"}:
        return list(DEMO_TENANTS)
    return tenant_scope(identity, tenant)


def _cache(identity: dict[str, object], name: str, builder, ttl: int = 10):
    return cached_call(identity_tenant_cache_key(identity, f"channel:{name}"), ttl, builder)


def _clear(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "channel:"))


def _log(request: Request, identity: dict[str, object], tenant: dict[str, object], action: str, reason: str, target_id: str | None = None) -> None:
    append_audit_event(
        category="channel_expansion",
        action=action,
        severity="medium",
        target_module="channel",
        target_id=target_id,
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=str(tenant["tenant_id"]),
        risk_score=41,
    )


@router.get("/summary", response_model=ChannelResponse)
def get_channel_summary(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ChannelResponse:
    _require_access(identity, tenant)
    return ChannelResponse(data=_cache(identity, "summary", lambda: channel_service.summary(_scope(identity, tenant))))


@router.get("/partners", response_model=ChannelResponse)
def get_channel_partners(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ChannelResponse:
    _require_access(identity, tenant)
    return ChannelResponse(data=_cache(identity, "partners", lambda: channel_service.partners(_scope(identity, tenant))))


@router.get("/resellers", response_model=ChannelResponse)
def get_channel_resellers(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ChannelResponse:
    _require_access(identity, tenant)
    return ChannelResponse(data=_cache(identity, "resellers", lambda: channel_service.resellers(_scope(identity, tenant))))


@router.get("/whitelabel", response_model=ChannelResponse)
def get_channel_whitelabel(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ChannelResponse:
    _require_access(identity, tenant)
    return ChannelResponse(data=_cache(identity, "whitelabel", lambda: channel_service.whitelabel(_scope(identity, tenant))))


@router.get("/oem", response_model=ChannelResponse)
def get_channel_oem(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ChannelResponse:
    _require_access(identity, tenant)
    return ChannelResponse(data=_cache(identity, "oem", lambda: channel_service.oem(_scope(identity, tenant))))


@router.get("/countries", response_model=ChannelResponse)
def get_channel_countries(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ChannelResponse:
    _require_access(identity, tenant)
    return ChannelResponse(data=_cache(identity, "countries", lambda: channel_service.countries(_scope(identity, tenant))))


@router.get("/revenue", response_model=ChannelResponse)
def get_channel_revenue(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ChannelResponse:
    _require_access(identity, tenant)
    return ChannelResponse(data=_cache(identity, "revenue", lambda: channel_service.revenue(_scope(identity, tenant))))


@router.get("/pipeline", response_model=ChannelResponse)
def get_channel_pipeline(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ChannelResponse:
    _require_access(identity, tenant)
    return ChannelResponse(data=_cache(identity, "pipeline", lambda: channel_service.pipeline(_scope(identity, tenant))))


@router.get("/certifications", response_model=ChannelResponse)
def get_channel_certifications(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ChannelResponse:
    _require_access(identity, tenant)
    return ChannelResponse(data=_cache(identity, "certifications", lambda: channel_service.certifications(_scope(identity, tenant))))


@router.get("/pricing", response_model=ChannelResponse)
def get_channel_pricing(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ChannelResponse:
    _require_access(identity, tenant)
    return ChannelResponse(data=_cache(identity, "pricing", lambda: channel_service.pricing(_scope(identity, tenant))))


@router.post("/partner/apply", response_model=ChannelMutationResponse)
def post_partner_apply(payload: ChannelMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ChannelMutationResponse:
    _require_access(identity, tenant)
    result = channel_store.partner_apply(str(tenant["tenant_id"]), payload.model_dump(exclude_none=True))
    _clear(identity)
    _log(request, identity, tenant, "partner_apply", payload.reason or "Channel partner application submitted", str(result["partner"]["partner_id"]))
    return ChannelMutationResponse(ok=True, message="Partner application submitted", data=result)


@router.post("/partner/approve", response_model=ChannelMutationResponse)
def post_partner_approve(payload: ChannelMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ChannelMutationResponse:
    _require_access(identity, tenant)
    if not payload.partner_id:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="partner_id is required")
    result = channel_store.update_partner(_scope(identity, tenant), payload.partner_id, "approve")
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partner not found in tenant scope")
    _clear(identity)
    _log(request, identity, tenant, "partner_approved", payload.reason or "Channel partner approved", payload.partner_id)
    return ChannelMutationResponse(ok=True, message="Partner approved", data=result)


@router.post("/partner/reject", response_model=ChannelMutationResponse)
def post_partner_reject(payload: ChannelMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ChannelMutationResponse:
    _require_access(identity, tenant)
    if not payload.partner_id:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="partner_id is required")
    result = channel_store.update_partner(_scope(identity, tenant), payload.partner_id, "reject")
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partner not found in tenant scope")
    _clear(identity)
    _log(request, identity, tenant, "partner_rejected", payload.reason or "Channel partner rejected", payload.partner_id)
    return ChannelMutationResponse(ok=True, message="Partner rejected", data=result)


@router.post("/partner/upgrade-tier", response_model=ChannelMutationResponse)
def post_partner_upgrade_tier(payload: ChannelMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ChannelMutationResponse:
    _require_access(identity, tenant)
    if not payload.partner_id:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="partner_id is required")
    result = channel_store.update_partner(_scope(identity, tenant), payload.partner_id, "upgrade", payload.tier)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partner not found in tenant scope")
    _clear(identity)
    _log(request, identity, tenant, "partner_tier_upgraded", payload.reason or "Channel partner tier upgraded", payload.partner_id)
    return ChannelMutationResponse(ok=True, message="Partner tier upgraded", data=result)


@router.post("/launch-country", response_model=ChannelMutationResponse)
def post_launch_country(payload: ChannelMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ChannelMutationResponse:
    _require_access(identity, tenant)
    country = payload.country or payload.country_id or "UAE"
    result = channel_store.launch_country(str(tenant["tenant_id"]), country)
    _clear(identity)
    _log(request, identity, tenant, "country_launched", payload.reason or f"Launched {country}", country)
    return ChannelMutationResponse(ok=True, message=f"{result['country']['name']} launch activated", data=result)


@router.post("/create-brand", response_model=ChannelMutationResponse)
def post_create_brand(payload: ChannelMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ChannelMutationResponse:
    _require_access(identity, tenant)
    result = channel_store.create_brand(str(tenant["tenant_id"]), payload.payload or payload.model_dump(exclude_none=True))
    _clear(identity)
    _log(request, identity, tenant, "brand_created", payload.reason or "White-label brand created", str(result["brand"]["brand_id"]))
    return ChannelMutationResponse(ok=True, message="White-label brand created", data=result)


@router.post("/create-oem", response_model=ChannelMutationResponse)
def post_create_oem(payload: ChannelMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ChannelMutationResponse:
    _require_access(identity, tenant)
    result = channel_store.create_oem(str(tenant["tenant_id"]), payload.payload or payload.model_dump(exclude_none=True))
    _clear(identity)
    _log(request, identity, tenant, "oem_created", payload.reason or "OEM contract created", str(result["oem"]["oem_id"]))
    return ChannelMutationResponse(ok=True, message="OEM contract created", data=result)


@router.post("/commission/pay", response_model=ChannelMutationResponse)
def post_commission_pay(payload: ChannelMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ChannelMutationResponse:
    _require_access(identity, tenant)
    if not payload.commission_id:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="commission_id is required")
    result = channel_store.pay_commission(_scope(identity, tenant), payload.commission_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Commission not found in tenant scope")
    _clear(identity)
    _log(request, identity, tenant, "commission_paid", payload.reason or "Partner commission paid", payload.commission_id)
    return ChannelMutationResponse(ok=True, message="Commission paid", data=result)


@router.post("/pricing/update", response_model=ChannelMutationResponse)
def post_pricing_update(payload: ChannelMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ChannelMutationResponse:
    _require_access(identity, tenant)
    if not payload.pricing_id:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="pricing_id is required")
    result = channel_store.update_pricing(_scope(identity, tenant), payload.pricing_id, payload.payload or payload.model_dump(exclude_none=True))
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pricing profile not found in tenant scope")
    _clear(identity)
    _log(request, identity, tenant, "pricing_updated", payload.reason or "Regional pricing updated", payload.pricing_id)
    return ChannelMutationResponse(ok=True, message="Regional pricing updated", data=result)


@router.post("/pipeline/update", response_model=ChannelMutationResponse)
def post_pipeline_update(payload: ChannelMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> ChannelMutationResponse:
    _require_access(identity, tenant)
    if not payload.pipeline_id:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="pipeline_id is required")
    result = channel_store.update_pipeline(_scope(identity, tenant), payload.pipeline_id, payload.payload or payload.model_dump(exclude_none=True))
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pipeline opportunity not found in tenant scope")
    _clear(identity)
    _log(request, identity, tenant, "pipeline_updated", payload.reason or "Regional pipeline updated", payload.pipeline_id)
    return ChannelMutationResponse(ok=True, message="Regional pipeline updated", data=result)

