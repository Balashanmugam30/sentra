import type { AppPermission, AppRole } from "@/types/rbac";

export type SecurityLevel = "tier_1" | "tier_2" | "tier_3" | "tier_4";

export interface RbacCurrentUser {
  id: string;
  name: string;
  email: string;
  role: Exclude<AppRole, "guest">;
  permissions: AppPermission[];
  accessible_modules: string[];
  security_level: SecurityLevel;
  tenant_id?: string;
  organization_name?: string;
  organization_slug?: string;
  org_role?: string;
  plan?: string;
  last_login: string | null;
}

export interface RbacRoleDefinition {
  role: Exclude<AppRole, "guest">;
  permissions: AppPermission[];
  accessible_modules: string[];
  security_level: SecurityLevel;
}

export interface RbacMeResponse {
  current_user: RbacCurrentUser;
}

export interface RbacRolesResponse {
  roles: RbacRoleDefinition[];
}

export interface RbacCheckRequest {
  permission: AppPermission;
}

export interface RbacCheckResponse {
  permission: AppPermission;
  allowed: boolean;
}

export interface RbacUserSummary {
  id: string;
  name: string;
  email: string;
  role: Exclude<AppRole, "guest">;
  permissions: AppPermission[];
  is_active: boolean;
  last_login: string | null;
}

export interface RbacUsersResponse {
  users: RbacUserSummary[];
}

export interface AssignRolePayload {
  email: string;
  role: Exclude<AppRole, "guest">;
}

export interface AssignRoleResponse {
  updated: boolean;
  user: RbacUserSummary;
}

export interface SeedDemoUsersResponse {
  created_count: number;
  updated_count: number;
  users: RbacUserSummary[];
}
