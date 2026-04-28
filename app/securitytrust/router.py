from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.ml.store import DEMO_TENANTS, tenant_scope
from app.rbac.guard import get_current_identity
from app.securitytrust.schemas import SecurityTrustMutationRequest, SecurityTrustMutationResponse, SecurityTrustResponse
from app.securitytrust.service import security_trust_service
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/security", tags=["Compliance Trust Certification OS"])

TRUST_READ_ROLES = {"super_admin", "admin", "security_manager", "security_lead", "executive", "operations_commander", "analyst"}
TRUST_MUTATION_ROLES = {"super_admin", "admin", "security_manager", "security_lead"}
TRUST_ORG_ROLES = {"owner", "org_admin", "security_admin", "ops_admin"}


def _require_access(identity: dict[str, object], tenant: dict[str, object]) -> None:
    if str(identity.get("role")) in TRUST_READ_ROLES or str(tenant.get("org_role") or "") in TRUST_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Compliance trust access required")


def _require_mutation(identity: dict[str, object], tenant: dict[str, object]) -> None:
    if str(identity.get("role")) in TRUST_MUTATION_ROLES or str(tenant.get("org_role") or "") in TRUST_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Policy approval access required")


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    if str(identity.get("role")) in {"super_admin", "admin", "security_manager", "security_lead", "executive"}:
        return list(DEMO_TENANTS)
    return tenant_scope(identity, tenant)


def _cache(identity: dict[str, object], name: str, builder, ttl: int = 12):
    return cached_call(identity_tenant_cache_key(identity, f"securitytrust:{name}"), ttl, builder)


def _clear(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "securitytrust:"))


def _log(request: Request, identity: dict[str, object], tenant: dict[str, object], action: str, reason: str, risk_score: int = 42) -> None:
    append_audit_event(
        category="compliance_trust",
        action=action,
        severity="high" if risk_score >= 65 else "medium",
        target_module="securitytrust",
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=str(tenant["tenant_id"]),
        risk_score=risk_score,
    )


@router.get("/compliance/summary", response_model=SecurityTrustResponse)
def get_compliance_summary(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> SecurityTrustResponse:
    _require_access(identity, tenant)
    return SecurityTrustResponse(data=_cache(identity, "compliance", lambda: security_trust_service.compliance_summary(_scope(identity, tenant)), 12))


@router.get("/privacy", response_model=SecurityTrustResponse)
def get_privacy(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> SecurityTrustResponse:
    _require_access(identity, tenant)
    return SecurityTrustResponse(data=_cache(identity, "privacy", lambda: security_trust_service.privacy(_scope(identity, tenant)), 12))


@router.get("/policies", response_model=SecurityTrustResponse)
def get_policies(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> SecurityTrustResponse:
    _require_access(identity, tenant)
    return SecurityTrustResponse(data=_cache(identity, "policies", lambda: security_trust_service.policies(_scope(identity, tenant)), 12))


@router.post("/policy/approve", response_model=SecurityTrustMutationResponse)
def approve_policy(payload: SecurityTrustMutationRequest, request: Request, tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> SecurityTrustMutationResponse:
    _require_mutation(identity, tenant)
    if not payload.policy_id:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="policy_id is required")
    decision = payload.decision or "approved"
    result = security_trust_service.approve_policy(_scope(identity, tenant), payload.policy_id, decision, payload.model_dump(exclude_none=True))
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found in tenant scope")
    _clear(identity)
    _log(request, identity, tenant, "trust_policy_approved", payload.reason or "Compliance policy decision recorded", 48)
    return SecurityTrustMutationResponse(ok=True, message="Policy decision recorded with audit evidence", data=result)


@router.get("/vendor-risk", response_model=SecurityTrustResponse)
def get_vendor_risk(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> SecurityTrustResponse:
    _require_access(identity, tenant)
    return SecurityTrustResponse(data=_cache(identity, "vendor_risk", lambda: security_trust_service.vendor_risk(_scope(identity, tenant)), 12))


@router.get("/evidence", response_model=SecurityTrustResponse)
def get_evidence(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> SecurityTrustResponse:
    _require_access(identity, tenant)
    return SecurityTrustResponse(data=_cache(identity, "evidence", lambda: security_trust_service.evidence(_scope(identity, tenant)), 15))


@router.get("/trust-executive", response_model=SecurityTrustResponse)
def get_trust_executive(tenant: dict[str, object] = Depends(get_tenant_context), identity: dict[str, object] = Depends(get_current_identity)) -> SecurityTrustResponse:
    _require_access(identity, tenant)
    return SecurityTrustResponse(data=_cache(identity, "trust_executive", lambda: security_trust_service.trust_executive(_scope(identity, tenant)), 15))
