from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class RbacCurrentUser(BaseModel):
    id: str
    name: str
    email: str
    role: str
    permissions: list[str]
    accessible_modules: list[str]
    security_level: str
    last_login: datetime | None = None


class RbacRoleDefinition(BaseModel):
    role: str
    permissions: list[str]
    accessible_modules: list[str]
    security_level: str


class RbacMeResponse(BaseModel):
    current_user: RbacCurrentUser


class RbacRolesResponse(BaseModel):
    roles: list[RbacRoleDefinition]


class PermissionCheckRequest(BaseModel):
    permission: str


class PermissionCheckResponse(BaseModel):
    permission: str
    allowed: bool


class RbacUserSummary(BaseModel):
    id: str
    name: str
    email: str
    role: str
    permissions: list[str]
    is_active: bool
    last_login: datetime | None = None


class RbacUsersResponse(BaseModel):
    users: list[RbacUserSummary]


class AssignRoleRequest(BaseModel):
    email: str
    role: str


class AssignRoleResponse(BaseModel):
    updated: bool
    user: RbacUserSummary


class SeedDemoUsersResponse(BaseModel):
    created_count: int
    updated_count: int
    users: list[RbacUserSummary]
