from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.audit.engine import append_audit_event
from app.rbac.guard import get_current_identity
from app.rbac.permissions import role_matches
from app.tenancy.branding import build_branding_payload
from app.tenancy.context import get_tenant_context, tenant_cache_key
from app.tenancy.models import PLAN_CATALOG
from app.tenancy.provisioning import tenancy_store
from app.tenancy.schemas import (
    BrandingRequest,
    OrgCreateRequest,
    OrgMeResponse,
    OrgMutationResponse,
    OrgPlansResponse,
    OrgSettingsPatchRequest,
    OrgSettingsResponse,
    OrgUsersResponse,
    DeactivateUserRequest,
    InviteUserRequest,
    SwitchWorkspaceRequest,
    UserRolePatchRequest,
    UsageMeter,
)
from app.tenancy.usage import build_usage_snapshot

router = APIRouter(prefix="/org", tags=["Organization Tenancy"])


def _require_org_admin(identity: dict[str, object], tenant: dict[str, object]) -> None:
    role = str(tenant.get("org_role") or "")
    if role not in {"owner", "org_admin", "security_admin", "billing_admin"} and not role_matches(
        str(identity.get("role") or ""),
        {"super_admin", "admin"},
    ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Organization admin access required")


def _workspace_organizations(tenant: dict[str, object]) -> list[dict[str, object]]:
    workspaces = []
    for membership in tenant.get("memberships", []):
        context = tenancy_store.resolve_context(
            {
                "user_id": membership["user_id"],
                "email": membership["email"],
                "name": membership["name"],
            },
            requested_tenant_id=membership["tenant_id"],
        )
        workspaces.append(context["organization"])
    unique: dict[str, dict[str, object]] = {}
    for workspace in workspaces:
        unique[str(workspace["id"])] = workspace
    return list(unique.values())


@router.get("/me", response_model=OrgMeResponse)
def get_org_me(
    tenant: dict[str, object] = Depends(get_tenant_context),
) -> OrgMeResponse:
    organization = tenant["organization"]
    return OrgMeResponse(
        tenant_id=str(tenant["tenant_id"]),
        organization_name=str(tenant["organization_name"]),
        organization_slug=str(tenant["organization_slug"]),
        org_role=tenant["org_role"],  # type: ignore[arg-type]
        department=str(tenant.get("department") or ""),
        plan=tenant["plan"],  # type: ignore[arg-type]
        organization=organization,  # type: ignore[arg-type]
        workspaces=_workspace_organizations(tenant),  # type: ignore[arg-type]
        branding=build_branding_payload(organization),  # type: ignore[arg-type]
        cache_namespace=tenant_cache_key(str(tenant["tenant_id"]), "dashboard"),
    )


@router.get("/users", response_model=OrgUsersResponse)
def get_org_users(
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> OrgUsersResponse:
    _require_org_admin(identity, tenant)
    return OrgUsersResponse(
        tenant_id=str(tenant["tenant_id"]),
        users=tenancy_store.list_users(str(tenant["tenant_id"])),  # type: ignore[arg-type]
    )


@router.get("/usage", response_model=UsageMeter)
def get_org_usage(
    tenant: dict[str, object] = Depends(get_tenant_context),
) -> UsageMeter:
    return UsageMeter(**build_usage_snapshot(str(tenant["tenant_id"])))


@router.get("/settings", response_model=OrgSettingsResponse)
def get_org_settings(
    tenant: dict[str, object] = Depends(get_tenant_context),
) -> OrgSettingsResponse:
    organization = tenant["organization"]
    return OrgSettingsResponse(
        organization=organization,  # type: ignore[arg-type]
        branding=build_branding_payload(organization),  # type: ignore[arg-type]
        security_policies={
            "workspace_switching": "server_verified",
            "invite_token_expiry": "72h",
            "tenant_id_source": "auth_session_only",
            "horizontal_escalation_protection": True,
        },
        data_retention={"hot_audit_days": 30, "archive_months": 24, "tenant_scoped_exports": True},
    )


@router.get("/plans", response_model=OrgPlansResponse)
def get_org_plans(
    tenant: dict[str, object] = Depends(get_tenant_context),
) -> OrgPlansResponse:
    plans = [{"tenant_id": str(tenant["tenant_id"]), **dict(plan)} for plan in PLAN_CATALOG.values()]
    return OrgPlansResponse(current_plan=tenant["plan"], plans=plans)  # type: ignore[arg-type]


@router.post("/create", response_model=OrgMutationResponse)
def create_org(
    request: Request,
    payload: OrgCreateRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> OrgMutationResponse:
    organization = tenancy_store.create_organization(
        name=payload.name,
        slug=payload.slug,
        industry=payload.industry,
        size=payload.size,
        country=payload.country,
        timezone=payload.timezone,
        plan=payload.plan,
        owner_user_id=str(identity["id"]),
        owner_email=str(identity["email"]),
        owner_name=str(identity["name"]),
    )
    append_audit_event(
        category="system",
        action="tenant_created",
        severity="medium",
        target_module="tenancy",
        target_id=str(organization["id"]),
        status="success",
        reason=f"Organization workspace created: {organization['name']}",
        request=request,
        identity=identity,
        risk_score=34,
    )
    return OrgMutationResponse(ok=True, tenant_id=str(organization["id"]), message="Organization created", data=organization)


@router.post("/invite-user", response_model=OrgMutationResponse)
def invite_user(
    request: Request,
    payload: InviteUserRequest,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> OrgMutationResponse:
    _require_org_admin(identity, tenant)
    invite = tenancy_store.invite_user(
        tenant_id=str(tenant["tenant_id"]),
        email=payload.email,
        name=payload.name,
        role=payload.role,
        department=payload.department,
        invited_by=str(identity["id"]),
    )
    append_audit_event(
        category="system",
        action="tenant_user_invited",
        severity="medium",
        target_module="tenancy",
        target_id=payload.email,
        status="success",
        reason=f"Invited {payload.email} as {payload.role}",
        request=request,
        identity=identity,
        risk_score=32,
    )
    return OrgMutationResponse(ok=True, tenant_id=str(tenant["tenant_id"]), message="Invite created", data=invite)


@router.patch("/user-role", response_model=OrgMutationResponse)
def patch_user_role(
    request: Request,
    payload: UserRolePatchRequest,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> OrgMutationResponse:
    _require_org_admin(identity, tenant)
    membership = tenancy_store.update_user_role(tenant_id=str(tenant["tenant_id"]), user_id=payload.user_id, role=payload.role)
    if membership is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization user not found")
    append_audit_event(
        category="rbac",
        action="tenant_role_changed",
        severity="high",
        target_module="tenancy",
        target_id=payload.user_id,
        status="success",
        reason=f"Tenant role changed to {payload.role}",
        request=request,
        identity=identity,
        risk_score=54,
    )
    return OrgMutationResponse(ok=True, tenant_id=str(tenant["tenant_id"]), message="Role updated", data=membership)


@router.patch("/settings", response_model=OrgMutationResponse)
def patch_org_settings(
    request: Request,
    payload: OrgSettingsPatchRequest,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> OrgMutationResponse:
    _require_org_admin(identity, tenant)
    updated = tenancy_store.update_settings(str(tenant["tenant_id"]), payload.model_dump(exclude_unset=True))
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    append_audit_event(
        category="system",
        action="tenant_settings_updated",
        severity="medium",
        target_module="tenancy",
        target_id=str(tenant["tenant_id"]),
        status="success",
        reason="Organization settings updated",
        request=request,
        identity=identity,
        risk_score=28,
    )
    return OrgMutationResponse(ok=True, tenant_id=str(tenant["tenant_id"]), message="Settings updated", data=updated)


@router.post("/branding", response_model=OrgMutationResponse)
def post_org_branding(
    request: Request,
    payload: BrandingRequest,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> OrgMutationResponse:
    _require_org_admin(identity, tenant)
    organization = tenancy_store.update_branding(
        str(tenant["tenant_id"]),
        logo_url=payload.logo_url,
        primary_color=payload.primary_color,
        name=payload.organization_name,
    )
    if organization is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    append_audit_event(
        category="system",
        action="tenant_branding_updated",
        severity="medium",
        target_module="tenancy",
        target_id=str(tenant["tenant_id"]),
        status="success",
        reason="Organization branding updated",
        request=request,
        identity=identity,
        risk_score=24,
    )
    return OrgMutationResponse(ok=True, tenant_id=str(tenant["tenant_id"]), message="Branding updated", data=build_branding_payload(organization))


@router.post("/switch-workspace", response_model=OrgMutationResponse)
def post_switch_workspace(
    request: Request,
    payload: SwitchWorkspaceRequest,
    identity: dict[str, object] = Depends(get_current_identity),
) -> OrgMutationResponse:
    switched = tenancy_store.switch_workspace(user_id=str(identity["id"]), tenant_id=payload.tenant_id)
    if switched is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Workspace unavailable for this user")
    append_audit_event(
        category="system",
        action="tenant_workspace_switched",
        severity="low",
        target_module="tenancy",
        target_id=payload.tenant_id,
        status="success",
        reason=f"Workspace switched to {switched['organization_name']}",
        request=request,
        identity={**identity, "tenant_id": payload.tenant_id},
        risk_score=18,
    )
    return OrgMutationResponse(ok=True, tenant_id=payload.tenant_id, message="Workspace switched", data=switched)


@router.post("/deactivate-user", response_model=OrgMutationResponse)
def post_deactivate_user(
    request: Request,
    payload: DeactivateUserRequest,
    tenant: dict[str, object] = Depends(get_tenant_context),
    identity: dict[str, object] = Depends(get_current_identity),
) -> OrgMutationResponse:
    _require_org_admin(identity, tenant)
    membership = tenancy_store.deactivate_user(tenant_id=str(tenant["tenant_id"]), user_id=payload.user_id)
    if membership is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization user not found")
    append_audit_event(
        category="rbac",
        action="tenant_user_deactivated",
        severity="high",
        target_module="tenancy",
        target_id=payload.user_id,
        status="success",
        reason="Organization user deactivated",
        request=request,
        identity=identity,
        risk_score=58,
    )
    return OrgMutationResponse(ok=True, tenant_id=str(tenant["tenant_id"]), message="User deactivated", data=membership)
