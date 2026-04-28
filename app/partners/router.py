from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.partners.schemas import (
    PartnerActionRequest,
    PartnerCertificationsResponse,
    PartnerCreateRequest,
    PartnerMutationResponse,
    PartnerNetworkResponse,
    PartnerReferralsResponse,
    PartnerRevenueResponse,
    PartnersLiveResponse,
)
from app.partners.service import partners_store
from app.rbac.guard import get_current_identity
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/partners", tags=["Partners"])

PARTNER_APP_ROLES = {"super_admin", "admin", "security_manager", "executive", "operations_commander"}
PARTNER_ORG_ROLES = {"owner", "org_admin", "billing_admin", "executive"}


def _require_access(identity: dict[str, object], tenant: dict[str, object]) -> None:
    if str(identity.get("role")) in PARTNER_APP_ROLES or str(tenant.get("org_role") or "") in PARTNER_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Partner ecosystem access required")


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str] | None:
    if identity.get("role") == "super_admin":
        return None
    return [str(tenant["tenant_id"])]


def _clear(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "partners:"))


def _log(request: Request, identity: dict[str, object], tenant: dict[str, object], action: str, reason: str, target_id: str | None = None) -> None:
    append_audit_event(
        category="partners",
        action=action,
        severity="medium",
        target_module="partners",
        target_id=target_id,
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=str(tenant["tenant_id"]),
        risk_score=24,
    )


@router.get("/live", response_model=PartnersLiveResponse)
def get_partners_live(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> PartnersLiveResponse:
    _require_access(identity, tenant)
    return PartnersLiveResponse(**cached_call(identity_tenant_cache_key(identity, "partners:live"), 12, partners_store.live))


@router.get("/network", response_model=PartnerNetworkResponse)
def get_partners_network(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> PartnerNetworkResponse:
    _require_access(identity, tenant)
    return PartnerNetworkResponse(partners=cached_call("partners:network", 20, partners_store.network))


@router.get("/referrals", response_model=PartnerReferralsResponse)
def get_partners_referrals(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> PartnerReferralsResponse:
    _require_access(identity, tenant)
    return PartnerReferralsResponse(referrals=partners_store.referrals(_scope(identity, tenant)))


@router.get("/revenue", response_model=PartnerRevenueResponse)
def get_partners_revenue(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> PartnerRevenueResponse:
    _require_access(identity, tenant)
    return PartnerRevenueResponse(**cached_call("partners:revenue", 15, partners_store.revenue))


@router.get("/certifications", response_model=PartnerCertificationsResponse)
def get_partners_certifications(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> PartnerCertificationsResponse:
    _require_access(identity, tenant)
    return PartnerCertificationsResponse(certifications=cached_call("partners:certifications", 20, partners_store.certifications))


@router.post("/create", response_model=PartnerMutationResponse)
def post_partners_create(payload: PartnerCreateRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> PartnerMutationResponse:
    _require_access(identity, tenant)
    partner = partners_store.create_partner(payload.model_dump())
    _clear(identity)
    _log(request, identity, tenant, "partner_created", f"Partner created: {partner['name']}", partner["partner_id"])
    return PartnerMutationResponse(ok=True, message="Partner created", data={"partner": partner})


@router.post("/approve", response_model=PartnerMutationResponse)
def post_partners_approve(payload: PartnerActionRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> PartnerMutationResponse:
    _require_access(identity, tenant)
    partner = partners_store.approve(payload.partner_id)
    if partner is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partner not found")
    _clear(identity)
    _log(request, identity, tenant, "partner_approved", f"Partner approved: {partner['name']}", payload.partner_id)
    return PartnerMutationResponse(ok=True, message="Partner approved", data={"partner": partner})


@router.post("/refer-lead", response_model=PartnerMutationResponse)
def post_partners_refer_lead(payload: PartnerActionRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> PartnerMutationResponse:
    _require_access(identity, tenant)
    referral = partners_store.refer_lead(str(tenant["tenant_id"]), payload.model_dump())
    if referral is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partner not found")
    _clear(identity)
    _log(request, identity, tenant, "partner_referral_created", f"Referral created for {referral['company_name']}", payload.partner_id)
    return PartnerMutationResponse(ok=True, message="Referral recorded", data={"referral": referral})


@router.post("/commission/payout", response_model=PartnerMutationResponse)
def post_partners_commission_payout(payload: PartnerActionRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> PartnerMutationResponse:
    _require_access(identity, tenant)
    payout = partners_store.payout(payload.partner_id)
    if payout is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partner not found")
    _clear(identity)
    _log(request, identity, tenant, "partner_commission_paid", f"Commission payout sent: {payout['amount']}", payload.partner_id)
    return PartnerMutationResponse(ok=True, message="Commission payout queued", data={"payout": payout})
