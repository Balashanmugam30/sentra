from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


AuthRole = Literal[
    "super_admin",
    "admin",
    "security_manager",
    "staff",
    "responder",
    "analyst",
    "guest_viewer",
    "executive",
    "operations_commander",
    "communications_lead",
    "security_lead",
    "viewer",
]


class AuthUser(BaseModel):
    id: str
    name: str
    email: str
    role: AuthRole
    tenant_id: str | None = None
    organization_name: str | None = None
    organization_slug: str | None = None
    org_role: str | None = None
    plan: str | None = None
    permissions: list[str] = Field(default_factory=list)
    accessible_modules: list[str] = Field(default_factory=list)
    is_active: bool
    mfa_enabled: bool
    created_at: datetime
    last_login: datetime | None = None


class BootstrapAdminRequest(BaseModel):
    email: str
    password: str = Field(..., min_length=10)
    name: str = Field(..., min_length=2)


class LoginRequest(BaseModel):
    email: str
    password: str = Field(..., min_length=1)


class FirebaseLoginRequest(BaseModel):
    id_token: str = Field(..., min_length=20)
    provider: str | None = None
    tenant_id: str | None = None


class RefreshRequest(BaseModel):
    refresh_token: str | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=10)


class AuthResponse(BaseModel):
    authenticated: bool
    access_token: str
    refresh_token: str
    expires_in: int = Field(..., ge=1)
    user: AuthUser


class LogoutResponse(BaseModel):
    completed: bool


class CurrentUserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: AuthRole
    tenant_id: str | None = None
    organization_name: str | None = None
    organization_slug: str | None = None
    org_role: str | None = None
    plan: str | None = None
    permissions: list[str] = Field(default_factory=list)
    accessible_modules: list[str] = Field(default_factory=list)
    last_login: datetime | None = None
    session_expires_at: datetime


class ChangePasswordResponse(BaseModel):
    changed: bool


class SessionDeviceResponse(BaseModel):
    session_id: str
    issued_at: datetime
    expires_at: datetime
    revoked: bool
    current: bool = False
    device_label: str = "Secure browser session"
    last_active: datetime | None = None


class SessionsResponse(BaseModel):
    sessions: list[SessionDeviceResponse]


class RevokeSessionRequest(BaseModel):
    session_id: str


class RevokeSessionResponse(BaseModel):
    revoked: bool
    revoked_count: int = 0


class BootstrapAdminResponse(BaseModel):
    created: bool
    user: AuthUser
