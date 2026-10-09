from __future__ import annotations

from datetime import datetime
from typing import Callable

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials

from app.auth.security import decode_token
from app.auth.store import auth_store
from app.audit.engine import append_audit_event
from app.auth.session import AuthContext, bearer_scheme, get_current_auth_context
from app.rbac.permissions import (
    get_accessible_modules_for_permissions,
    get_permissions_for_role,
    get_security_level_for_role,
    normalize_role,
    role_matches,
)
from app.tenancy.provisioning import tenancy_store


def build_identity(
    user: dict[str, object],
    *,
    session_id: str | None = None,
    tenant_id: str | None = None,
) -> dict[str, object]:
    role = normalize_role(str(user["role"]))
    permissions = get_permissions_for_role(role)
    token_tenant = str(tenant_id or user.get("tenant_id") or "").strip()
    tenant = tenancy_store.resolve_context(user, requested_tenant_id=token_tenant or None)
    resolved_tenant = token_tenant if token_tenant else str(tenant["tenant_id"])
    return {
        "id": str(user["user_id"]),
        "name": str(user["name"]),
        "email": str(user["email"]),
        "role": role,
        "tenant_id": resolved_tenant,
        "organization_name": str(tenant.get("organization_name") or "Sentra Operational Command"),
        "organization_slug": str(tenant.get("organization_slug") or "sentra-ops"),
        "org_role": str(tenant.get("org_role") or "owner"),
        "plan": str(tenant["plan"]["plan_name"]) if isinstance(tenant.get("plan"), dict) and "plan_name" in tenant["plan"] else "business",
        "permissions": permissions,
        "accessible_modules": get_accessible_modules_for_permissions(permissions),
        "security_level": get_security_level_for_role(role),
        "assigned_buildings": user.get("assigned_buildings") or ["Grand Meridian Hotel"],
        "assigned_zones": user.get("assigned_zones") or (
            ["Zone 3", "Kitchen Zone B"] if role in {"staff", "responder"} else ["*"]
        ),
        "session_id": session_id,
        "last_login": (
            datetime.fromisoformat(str(user["last_login"])) if user.get("last_login") else None
        ),
    }


def get_current_identity(
    context: AuthContext = Depends(get_current_auth_context),
) -> dict[str, object]:
    token_tenant = str(context.payload.get("tenant_id") or "") or None
    return build_identity(
        context.user,
        session_id=str(context.payload.get("sid") or "") or None,
        tenant_id=token_tenant,
    )


def get_optional_identity(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict[str, object] | None:
    access_cookie_name = request.app.state.settings.auth_access_cookie_name
    token = (
        credentials.credentials
        if credentials and credentials.scheme.lower() == "bearer"
        else request.cookies.get(access_cookie_name)
    )
    if not token:
        return None

    try:
        payload = decode_token(token, expected_type="access")
    except HTTPException:
        return None

    user = auth_store.get_user_by_id(str(payload["sub"]))
    if user is None or not user["is_active"]:
        return None

    token_tenant = str(payload.get("tenant_id") or "") or None
    return build_identity(
        user,
        session_id=str(payload.get("sid") or "") or None,
        tenant_id=token_tenant,
    )


def require_permission(permission: str) -> Callable[[dict[str, object]], dict[str, object]]:
    def dependency(
        request: Request,
        identity: dict[str, object] = Depends(get_current_identity),
    ) -> dict[str, object]:
        permissions = identity["permissions"]
        if permission not in permissions:
            append_audit_event(
                category="rbac",
                action="permission_denied",
                severity="high",
                target_module=request.url.path,
                status="denied",
                reason=f"Missing permission: {permission}",
                request=request,
                identity=identity,
                risk_score=68,
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission '{permission}' required",
            )
        return identity

    return dependency


def require_any_permission(*permissions: str) -> Callable[[dict[str, object]], dict[str, object]]:
    def dependency(
        request: Request,
        identity: dict[str, object] = Depends(get_current_identity),
    ) -> dict[str, object]:
        current = set(identity["permissions"])
        if current.intersection(permissions):
            return identity
        append_audit_event(
            category="rbac",
            action="permission_denied",
            severity="high",
            target_module=request.url.path,
            status="denied",
            reason=f"Missing any of: {', '.join(permissions)}",
            request=request,
            identity=identity,
            risk_score=68,
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"One of {', '.join(permissions)} required",
        )

    return dependency


def require_role(role: str) -> Callable[[dict[str, object]], dict[str, object]]:
    def dependency(
        request: Request,
        identity: dict[str, object] = Depends(get_current_identity),
    ) -> dict[str, object]:
        if not role_matches(str(identity["role"]), {normalize_role(role)}):
            append_audit_event(
                category="rbac",
                action="role_denied",
                severity="high",
                target_module=request.url.path,
                status="denied",
                reason=f"Required role: {normalize_role(role)}",
                request=request,
                identity=identity,
                risk_score=70,
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{normalize_role(role)}' required",
            )
        return identity

    return dependency


def require_zone_scope(
    *,
    zone_param: str = "zone",
    building_param: str = "building",
) -> Callable[[dict[str, object]], dict[str, object]]:
    def dependency(
        request: Request,
        identity: dict[str, object] = Depends(get_current_identity),
    ) -> dict[str, object]:
        role = str(identity["role"])
        if role_matches(role, {"super_admin", "admin", "security_manager", "operations_commander", "security_lead"}):
            return identity

        requested_zone = request.path_params.get(zone_param) or request.query_params.get(zone_param)
        requested_building = request.path_params.get(building_param) or request.query_params.get(building_param)
        assigned_zones = {str(zone) for zone in identity.get("assigned_zones", [])}
        assigned_buildings = {str(building) for building in identity.get("assigned_buildings", [])}
        zone_allowed = not requested_zone or "*" in assigned_zones or str(requested_zone) in assigned_zones
        building_allowed = (
            not requested_building
            or "*" in assigned_buildings
            or str(requested_building) in assigned_buildings
        )
        if zone_allowed and building_allowed:
            return identity

        append_audit_event(
            category="rbac",
            action="scope_denied",
            severity="high",
            target_module=request.url.path,
            status="denied",
            reason="Requested building or zone is outside assigned scope",
            request=request,
            identity=identity,
            risk_score=72,
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Assigned zone or building scope required",
        )

    return dependency
