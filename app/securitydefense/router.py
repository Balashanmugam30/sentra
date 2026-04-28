from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.ml.store import DEMO_TENANTS, tenant_scope
from app.rbac.guard import get_current_identity
from app.securitydefense.schemas import (
    SecurityDefenseListResponse,
    SecurityDefenseMutationRequest,
    SecurityDefenseMutationResponse,
    SecurityDefenseResponse,
)
from app.securitydefense.service import security_defense_service
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/security", tags=["Zero Trust Threat Defense OS"])

DEFENSE_READ_ROLES = {"super_admin", "admin", "security_manager", "security_lead", "executive", "operations_commander", "analyst"}
DEFENSE_MUTATION_ROLES = {"super_admin", "admin", "security_manager", "security_lead"}
DEFENSE_ORG_ROLES = {"owner", "org_admin", "security_admin", "ops_admin"}


def _require_access(identity: dict[str, object], tenant: dict[str, object]) -> None:
    if str(identity.get("role")) in DEFENSE_READ_ROLES or str(tenant.get("org_role") or "") in DEFENSE_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Threat defense access required")


def _require_mutation(identity: dict[str, object], tenant: dict[str, object]) -> None:
    if str(identity.get("role")) in DEFENSE_MUTATION_ROLES or str(tenant.get("org_role") or "") in DEFENSE_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Threat response access required")


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    if str(identity.get("role")) in {"super_admin", "admin", "security_manager", "security_lead", "executive"}:
        return list(DEMO_TENANTS)
    return tenant_scope(identity, tenant)


def _cache(identity: dict[str, object], name: str, builder, ttl: int = 6):
    return cached_call(identity_tenant_cache_key(identity, f"securitydefense:{name}"), ttl, builder)


def _clear(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "securitydefense:"))


def _log(
    request: Request,
    identity: dict[str, object],
    tenant: dict[str, object],
    action: str,
    reason: str,
    risk_score: int,
) -> None:
    append_audit_event(
        category="zero_trust_defense",
        action=action,
        severity="critical" if risk_score >= 85 else "high" if risk_score >= 65 else "medium",
        target_module="securitydefense",
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=str(tenant["tenant_id"]),
        risk_score=risk_score,
    )


@router.get("/soc/summary", response_model=SecurityDefenseResponse)
def get_soc_summary(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> SecurityDefenseResponse:
    _require_access(identity, tenant)
    return SecurityDefenseResponse(data=_cache(identity, "soc_summary", lambda: security_defense_service.soc_summary(_scope(identity, tenant)), 5))


@router.get("/soc/incidents", response_model=SecurityDefenseListResponse)
def get_soc_incidents(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> SecurityDefenseListResponse:
    _require_access(identity, tenant)
    return SecurityDefenseListResponse(items=_cache(identity, "soc_incidents", lambda: security_defense_service.incidents(_scope(identity, tenant)), 6))


@router.get("/threats", response_model=SecurityDefenseResponse)
def get_threats(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> SecurityDefenseResponse:
    _require_access(identity, tenant)
    return SecurityDefenseResponse(data=_cache(identity, "threats", lambda: security_defense_service.threats(_scope(identity, tenant)), 6))


@router.get("/zero-trust", response_model=SecurityDefenseResponse)
def get_zero_trust(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> SecurityDefenseResponse:
    _require_access(identity, tenant)
    return SecurityDefenseResponse(data=_cache(identity, "zero_trust", lambda: security_defense_service.zero_trust(_scope(identity, tenant)), 6))


@router.get("/forensics", response_model=SecurityDefenseResponse)
def get_forensics(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> SecurityDefenseResponse:
    _require_access(identity, tenant)
    return SecurityDefenseResponse(data=_cache(identity, "forensics", lambda: security_defense_service.forensics(_scope(identity, tenant)), 10))


@router.post("/respond/lock-user", response_model=SecurityDefenseMutationResponse)
def lock_user(
    payload: SecurityDefenseMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> SecurityDefenseMutationResponse:
    _require_mutation(identity, tenant)
    result = security_defense_service.respond(_scope(identity, tenant), "lock_user", payload.model_dump(exclude_none=True))
    _clear(identity)
    _log(request, identity, tenant, "defense_lock_user", payload.reason or "Zero trust user lock", 76)
    return SecurityDefenseMutationResponse(ok=True, message="User locked and admin notification queued", data=result)


@router.post("/respond/revoke-session", response_model=SecurityDefenseMutationResponse)
def revoke_session(
    payload: SecurityDefenseMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> SecurityDefenseMutationResponse:
    _require_mutation(identity, tenant)
    result = security_defense_service.respond(_scope(identity, tenant), "revoke_session", payload.model_dump(exclude_none=True))
    _clear(identity)
    _log(request, identity, tenant, "defense_revoke_session", payload.reason or "Threat defense session revoke", 82)
    return SecurityDefenseMutationResponse(ok=True, message="Session revoked and forensic evidence updated", data=result)


@router.post("/respond/step-up-auth", response_model=SecurityDefenseMutationResponse)
def step_up_auth(
    payload: SecurityDefenseMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> SecurityDefenseMutationResponse:
    _require_mutation(identity, tenant)
    result = security_defense_service.respond(_scope(identity, tenant), "step_up_auth", payload.model_dump(exclude_none=True))
    _clear(identity)
    _log(request, identity, tenant, "defense_step_up_auth", payload.reason or "Step-up authentication triggered", 64)
    return SecurityDefenseMutationResponse(ok=True, message="Step-up authentication required", data=result)


@router.post("/respond/isolate-key", response_model=SecurityDefenseMutationResponse)
def isolate_key(
    payload: SecurityDefenseMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> SecurityDefenseMutationResponse:
    _require_mutation(identity, tenant)
    result = security_defense_service.respond(_scope(identity, tenant), "isolate_key", payload.model_dump(exclude_none=True))
    _clear(identity)
    _log(request, identity, tenant, "defense_isolate_key", payload.reason or "API key isolated", 70)
    return SecurityDefenseMutationResponse(ok=True, message="API key isolated and fallback queue armed", data=result)


@router.get("/executive", response_model=SecurityDefenseResponse)
def get_executive(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> SecurityDefenseResponse:
    _require_access(identity, tenant)
    return SecurityDefenseResponse(data=_cache(identity, "executive", lambda: security_defense_service.executive(_scope(identity, tenant)), 10))
