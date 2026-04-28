from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


OrgRole = Literal[
    "owner",
    "org_admin",
    "security_admin",
    "ops_admin",
    "billing_admin",
    "executive",
    "operator",
    "analyst",
    "viewer",
]


class Organization(BaseModel):
    id: str
    slug: str
    name: str
    industry: str
    size: str
    country: str
    timezone: str
    logo_url: str = ""
    primary_color: str
    created_at: datetime
    status: str
    plan: str


class TenantPlan(BaseModel):
    tenant_id: str
    plan_name: str
    seats_limit: int
    modules_enabled: list[str]
    api_limit: int
    storage_limit_gb: float
    description: str | None = None


class OrganizationUser(BaseModel):
    user_id: str
    tenant_id: str
    email: str
    name: str
    role: OrgRole
    department: str
    invited_by: str
    joined_at: datetime
    active: bool
    invite_token: str | None = None
    invite_expires_at: datetime | None = None


class UsageMeter(BaseModel):
    tenant_id: str
    active_users: int
    incidents_month: int
    ai_actions_month: int
    reports_generated: int
    api_calls_month: int
    storage_used_gb: float
    seats_limit: int
    seat_utilization_percent: int = Field(ge=0)
    api_utilization_percent: int = Field(ge=0)
    storage_utilization_percent: int = Field(ge=0)


class BrandingPayload(BaseModel):
    tenant_id: str
    organization_name: str
    logo_url: str
    primary_color: str
    pdf_report_header: str
    email_template_signature: str


class OrgMeResponse(BaseModel):
    tenant_id: str
    organization_name: str
    organization_slug: str
    org_role: OrgRole
    department: str
    plan: TenantPlan
    organization: Organization
    workspaces: list[Organization]
    branding: BrandingPayload
    cache_namespace: str


class OrgUsersResponse(BaseModel):
    tenant_id: str
    users: list[OrganizationUser]


class OrgSettingsResponse(BaseModel):
    organization: Organization
    branding: BrandingPayload
    security_policies: dict[str, Any]
    data_retention: dict[str, Any]


class OrgPlansResponse(BaseModel):
    current_plan: TenantPlan
    plans: list[TenantPlan]


class OrgCreateRequest(BaseModel):
    name: str = Field(..., min_length=2)
    slug: str = Field(..., min_length=2)
    industry: str = "enterprise"
    size: str = "unknown"
    country: str = "Global"
    timezone: str = "UTC"
    plan: Literal["starter", "business", "enterprise", "government"] = "business"


class InviteUserRequest(BaseModel):
    email: str
    name: str = ""
    role: OrgRole = "viewer"
    department: str = "Unassigned"


class UserRolePatchRequest(BaseModel):
    user_id: str
    role: OrgRole


class OrgSettingsPatchRequest(BaseModel):
    name: str | None = None
    industry: str | None = None
    size: str | None = None
    country: str | None = None
    timezone: str | None = None
    status: str | None = None


class BrandingRequest(BaseModel):
    logo_url: str | None = None
    primary_color: str | None = None
    organization_name: str | None = None


class SwitchWorkspaceRequest(BaseModel):
    tenant_id: str


class DeactivateUserRequest(BaseModel):
    user_id: str


class OrgMutationResponse(BaseModel):
    ok: bool
    tenant_id: str
    message: str
    data: dict[str, Any]

