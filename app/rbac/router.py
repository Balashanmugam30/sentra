from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.auth.store import auth_store
from app.audit.engine import append_audit_event
from app.rbac.guard import get_current_identity, get_optional_identity, require_permission
from app.rbac.permissions import (
    ENTERPRISE_ROLES,
    get_accessible_modules_for_permissions,
    get_permissions_for_role,
    get_security_level_for_role,
    role_matches,
)
from app.rbac.schemas import (
    AssignRoleRequest,
    AssignRoleResponse,
    PermissionCheckRequest,
    PermissionCheckResponse,
    RbacMeResponse,
    RbacRoleDefinition,
    RbacRolesResponse,
    RbacUsersResponse,
    SeedDemoUsersResponse,
)
from app.rbac.store import assign_role_to_user, list_serialized_users, seed_demo_users

router = APIRouter(prefix="/rbac", tags=["RBAC"])


@router.get("/me", response_model=RbacMeResponse)
def get_rbac_me_route(
    identity: dict[str, object] = Depends(get_current_identity),
) -> RbacMeResponse:
    return RbacMeResponse(current_user=identity)


@router.get("/roles", response_model=RbacRolesResponse)
def get_rbac_roles_route(
    _: dict[str, object] = Depends(get_current_identity),
) -> RbacRolesResponse:
    roles = []
    for role in ENTERPRISE_ROLES:
        permissions = get_permissions_for_role(role)
        roles.append(
            RbacRoleDefinition(
                role=role,
                permissions=permissions,
                accessible_modules=get_accessible_modules_for_permissions(permissions),
                security_level=get_security_level_for_role(role),
            )
        )
    return RbacRolesResponse(roles=roles)


@router.post("/check", response_model=PermissionCheckResponse)
def post_rbac_check_route(
    request: Request,
    payload: PermissionCheckRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> PermissionCheckResponse:
    allowed = payload.permission in identity["permissions"]
    if not allowed:
        append_audit_event(
            category="rbac",
            action="permission_check_denied",
            severity="medium",
            target_module="rbac",
            status="denied",
            reason=f"Permission check failed for {payload.permission}",
            request=request,
            identity=identity,
            risk_score=52,
        )
    return PermissionCheckResponse(
        permission=payload.permission,
        allowed=allowed,
    )


@router.get("/users", response_model=RbacUsersResponse)
def get_rbac_users_route(
    _: dict[str, object] = Depends(require_permission("users.manage")),
) -> RbacUsersResponse:
    return RbacUsersResponse(users=list_serialized_users())


@router.post("/assign-role", response_model=AssignRoleResponse)
def post_assign_role_route(
    request: Request,
    payload: AssignRoleRequest,
    identity: dict[str, object] = Depends(require_permission("roles.manage")),
) -> AssignRoleResponse:
    existing_user = auth_store.get_user_by_email(payload.email)
    before_role = existing_user["role"] if existing_user else None
    try:
        user = assign_role_to_user(email=payload.email, role=payload.role)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    append_audit_event(
        category="rbac",
        action="role_assignment",
        severity="medium",
        target_module="rbac",
        status="success",
        reason=f"Assigned {payload.role} to {payload.email}",
        request=request,
        identity=identity,
        target_id=user["id"],
        before_state={"role": before_role} if before_role else None,
        after_state={"role": user["role"]},
        risk_score=54,
    )
    return AssignRoleResponse(updated=True, user=user)


@router.post("/seed-demo-users", response_model=SeedDemoUsersResponse)
def post_seed_demo_users_route(
    identity: dict[str, object] | None = Depends(get_optional_identity),
) -> SeedDemoUsersResponse:
    if auth_store.has_users() and (
        identity is None or not role_matches(str(identity["role"]), {"super_admin", "admin"})
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super_admin can reseed demo users",
        )

    created_count, updated_count, users = seed_demo_users()
    return SeedDemoUsersResponse(
        created_count=created_count,
        updated_count=updated_count,
        users=users,
    )
