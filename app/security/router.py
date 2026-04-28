from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.core.runtime_cache import cached_call, clear_runtime_cache
from app.ml.store import DEMO_TENANTS, tenant_scope
from app.rbac.guard import get_current_identity
from app.security.schemas import (
    SecurityCenterListResponse,
    SecurityCenterMutationRequest,
    SecurityCenterMutationResponse,
    SecurityCenterResponse,
)
from app.security.service import security_center_service
from app.tenancy.context import get_tenant_context, identity_tenant_cache_key

router = APIRouter(prefix="/security", tags=["Identity Access Security"])

SECURITY_CENTER_ROLES = {
    "super_admin",
    "admin",
    "security_manager",
    "security_lead",
    "executive",
    "operations_commander",
    "analyst",
}
SECURITY_MUTATION_ROLES = {"super_admin", "admin", "security_manager", "security_lead"}
SECURITY_ORG_ROLES = {"owner", "org_admin", "security_admin", "ops_admin"}


def _require_access(identity: dict[str, object], tenant: dict[str, object]) -> None:
    if str(identity.get("role")) in SECURITY_CENTER_ROLES or str(tenant.get("org_role") or "") in SECURITY_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Identity security access required")


def _require_mutation(identity: dict[str, object], tenant: dict[str, object]) -> None:
    if str(identity.get("role")) in SECURITY_MUTATION_ROLES or str(tenant.get("org_role") or "") in SECURITY_ORG_ROLES:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Identity administration access required")


def _scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    if str(identity.get("role")) in {"super_admin", "admin", "security_manager", "security_lead", "executive"}:
        return list(DEMO_TENANTS)
    return tenant_scope(identity, tenant)


def _cache(identity: dict[str, object], name: str, builder, ttl: int = 8):
    return cached_call(identity_tenant_cache_key(identity, f"securitycenter:{name}"), ttl, builder)


def _clear(identity: dict[str, object]) -> None:
    clear_runtime_cache(identity_tenant_cache_key(identity, "securitycenter:"))


def _log(
    request: Request,
    identity: dict[str, object],
    tenant: dict[str, object],
    action: str,
    reason: str,
    risk_score: int = 46,
) -> None:
    append_audit_event(
        category="identity_access",
        action=action,
        severity="high" if risk_score >= 70 else "medium",
        target_module="security",
        status="success",
        reason=reason,
        request=request,
        identity=identity,
        tenant_id=str(tenant["tenant_id"]),
        risk_score=risk_score,
    )


@router.get("/summary", response_model=SecurityCenterResponse)
def get_summary(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> SecurityCenterResponse:
    _require_access(identity, tenant)
    return SecurityCenterResponse(data=_cache(identity, "summary", lambda: security_center_service.summary(_scope(identity, tenant)), 8))


@router.get("/users", response_model=SecurityCenterListResponse)
def get_users(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> SecurityCenterListResponse:
    _require_access(identity, tenant)
    return SecurityCenterListResponse(items=_cache(identity, "users", lambda: security_center_service.users(_scope(identity, tenant)), 8))


@router.post("/user/invite", response_model=SecurityCenterMutationResponse)
def invite_user(
    payload: SecurityCenterMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> SecurityCenterMutationResponse:
    _require_mutation(identity, tenant)
    result = security_center_service.invite_user(_scope(identity, tenant), payload.model_dump(exclude_none=True))
    _clear(identity)
    _log(request, identity, tenant, "security_user_invited", payload.reason or "Identity invite issued", 38)
    return SecurityCenterMutationResponse(ok=True, message="User invite queued with tenant-scoped onboarding", data=result)


@router.post("/user/disable", response_model=SecurityCenterMutationResponse)
def disable_user(
    payload: SecurityCenterMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> SecurityCenterMutationResponse:
    _require_mutation(identity, tenant)
    if not payload.user_id:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="user_id is required")
    result = security_center_service.disable_user(_scope(identity, tenant), payload.user_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found in tenant scope")
    _clear(identity)
    _log(request, identity, tenant, "security_user_disabled", payload.reason or "User disabled by identity admin", 52)
    return SecurityCenterMutationResponse(ok=True, message="User disabled and sessions flagged", data=result)


@router.post("/user/role", response_model=SecurityCenterMutationResponse)
def change_user_role(
    payload: SecurityCenterMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> SecurityCenterMutationResponse:
    _require_mutation(identity, tenant)
    if not payload.user_id or not payload.role:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="user_id and role are required")
    result = security_center_service.set_user_role(_scope(identity, tenant), payload.user_id, payload.role)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found in tenant scope")
    _clear(identity)
    _log(request, identity, tenant, "security_role_changed", payload.reason or "RBAC role changed", 62)
    return SecurityCenterMutationResponse(ok=True, message="Role updated with audit evidence", data=result)


@router.post("/user/reset-mfa", response_model=SecurityCenterMutationResponse)
def reset_user_mfa(
    payload: SecurityCenterMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> SecurityCenterMutationResponse:
    _require_mutation(identity, tenant)
    if not payload.user_id:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="user_id is required")
    result = security_center_service.reset_mfa(_scope(identity, tenant), payload.user_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found in tenant scope")
    _clear(identity)
    _log(request, identity, tenant, "security_mfa_reset", payload.reason or "MFA reset required", 48)
    return SecurityCenterMutationResponse(ok=True, message="MFA reset required on next sign-in", data=result)


@router.get("/orgs", response_model=SecurityCenterListResponse)
def get_organizations(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> SecurityCenterListResponse:
    _require_access(identity, tenant)
    return SecurityCenterListResponse(items=_cache(identity, "orgs", lambda: security_center_service.organizations(_scope(identity, tenant)), 10))


@router.post("/org/create", response_model=SecurityCenterMutationResponse)
def create_organization(
    payload: SecurityCenterMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> SecurityCenterMutationResponse:
    _require_mutation(identity, tenant)
    result = security_center_service.create_org(_scope(identity, tenant), payload.model_dump(exclude_none=True))
    _clear(identity)
    _log(request, identity, tenant, "security_org_created", payload.reason or "Tenant workspace created", 58)
    return SecurityCenterMutationResponse(ok=True, message="Organization workspace created", data=result)


@router.post("/org/switch", response_model=SecurityCenterMutationResponse)
def switch_organization(
    payload: SecurityCenterMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> SecurityCenterMutationResponse:
    _require_access(identity, tenant)
    if not payload.org_id:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="org_id is required")
    result = security_center_service.switch_org(_scope(identity, tenant), payload.org_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found in tenant scope")
    _clear(identity)
    _log(request, identity, tenant, "security_org_switched", payload.reason or "Identity workspace switched", 36)
    return SecurityCenterMutationResponse(ok=True, message="Organization context switched", data=result)


@router.get("/sessions", response_model=SecurityCenterListResponse)
def get_sessions(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> SecurityCenterListResponse:
    _require_access(identity, tenant)
    return SecurityCenterListResponse(items=_cache(identity, "sessions", lambda: security_center_service.sessions(_scope(identity, tenant)), 6))


@router.post("/session/revoke", response_model=SecurityCenterMutationResponse)
def revoke_session(
    payload: SecurityCenterMutationRequest,
    request: Request,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> SecurityCenterMutationResponse:
    _require_mutation(identity, tenant)
    if not payload.session_id:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="session_id is required")
    result = security_center_service.revoke_session(_scope(identity, tenant), payload.session_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found in tenant scope")
    _clear(identity)
    _log(request, identity, tenant, "security_session_revoked", payload.reason or "Session revoked by identity admin", 64)
    return SecurityCenterMutationResponse(ok=True, message="Session revoked and device marked for review", data=result)


@router.get("/roles", response_model=SecurityCenterListResponse)
def get_roles(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> SecurityCenterListResponse:
    _require_access(identity, tenant)
    return SecurityCenterListResponse(items=_cache(identity, "roles", lambda: security_center_service.roles(_scope(identity, tenant)), 20))
