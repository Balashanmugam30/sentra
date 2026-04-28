import type { ApiError } from "@/types/api";
import type { AppPermission, AppRole } from "@/types/rbac";

export type SecureAuthRole = Exclude<AppRole, "guest">;

export interface SecureAuthUser {
  id: string;
  name: string;
  email: string;
  role: SecureAuthRole;
  tenant_id?: string | null;
  organization_name?: string | null;
  organization_slug?: string | null;
  org_role?: string | null;
  plan?: string | null;
  permissions?: AppPermission[];
  accessible_modules?: string[];
  is_active?: boolean;
  mfa_enabled?: boolean;
  created_at?: string;
  last_login?: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface FirebaseLoginPayload {
  id_token: string;
  provider?: string | null;
  tenant_id?: string | null;
}

export interface BootstrapAdminPayload {
  email: string;
  password: string;
  name: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export interface RefreshPayload {
  refresh_token?: string;
}

export interface AuthLoginResponse {
  authenticated: boolean;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: SecureAuthUser;
}

export interface AuthMeResponse {
  id: string;
  name: string;
  email: string;
  role: SecureAuthRole;
  tenant_id?: string | null;
  organization_name?: string | null;
  organization_slug?: string | null;
  org_role?: string | null;
  plan?: string | null;
  permissions: AppPermission[];
  accessible_modules: string[];
  last_login: string | null;
  session_expires_at: string;
}

export interface AuthLogoutResponse {
  completed: boolean;
}

export interface AuthChangePasswordResponse {
  changed: boolean;
}

export interface BootstrapAdminResponse {
  created: boolean;
  user: SecureAuthUser;
}

export interface ApiResult<T> {
  ok: boolean;
  data?: T;
  error?: ApiError;
}
