import type { ApiError } from "@/types/api";
import type { AppPermission, AppRole } from "@/types/rbac";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
export type DeviceSessionStatus = "active" | "revoked";

export interface AuthenticatedUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  username?: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  providerId: string | null;
  role: AppRole;
  permissions?: AppPermission[];
  accessibleModules?: string[];
  tenantId?: string | null;
  organizationName?: string | null;
  organizationSlug?: string | null;
  orgRole?: string | null;
  plan?: string | null;
  mfaEnabled?: boolean;
  lastLogin?: string | null;
}

export interface AuthResult {
  user: AuthenticatedUser;
  token: string;
  refreshToken: string;
  expiresIn: number;
  tokenExpiresAt: string;
  tokenIssuedAt: string;
  tokenRefreshedAt: string;
}

export interface PhoneAuthSession {
  phoneNumber: string;
  verificationId: string;
  mode: "sign_in" | "link";
}

export interface DeviceSession {
  device_id: string;
  user_id: string;
  last_active: string;
  session_status: DeviceSessionStatus;
}

export interface NormalizedAuthResponse {
  success: boolean;
  data?: AuthResult;
  error?: ApiError;
  requiresOtp?: boolean;
}

export interface BackendAuthUser {
  id: string;
  name: string;
  email: string;
  role: Exclude<AppRole, "guest">;
  permissions?: AppPermission[];
  accessible_modules?: string[];
  tenant_id?: string | null;
  organization_name?: string | null;
  organization_slug?: string | null;
  org_role?: string | null;
  plan?: string | null;
  is_active?: boolean;
  mfa_enabled?: boolean;
  created_at?: string;
  last_login?: string | null;
}

export function mapBackendUserToAuthUser(
  user: BackendAuthUser,
  fallbackRole: AppRole = "guest_viewer",
): AuthenticatedUser {
  const resolvedRole = (user.role ?? fallbackRole) as AppRole;
  return {
    uid: user.id,
    email: user.email,
    displayName: user.name,
    username: user.email?.split("@")[0] ?? null,
    phoneNumber: null,
    photoURL: null,
    providerId: "password",
    role: resolvedRole,
    permissions: user.permissions ?? [],
    accessibleModules: user.accessible_modules ?? [],
    tenantId: user.tenant_id ?? null,
    organizationName: user.organization_name ?? null,
    organizationSlug: user.organization_slug ?? null,
    orgRole: user.org_role ?? null,
    plan: user.plan ?? null,
    mfaEnabled: user.mfa_enabled ?? false,
    lastLogin: user.last_login ?? null,
  };
}

export function mapFirebaseUserToAuthUser(
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    phoneNumber: string | null;
    photoURL: string | null;
    providerData?: Array<{ providerId?: string | null }>;
  },
  role: AppRole = "guest_viewer",
): AuthenticatedUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    username: user.email?.split("@")[0] ?? null,
    phoneNumber: user.phoneNumber,
    photoURL: user.photoURL,
    providerId: user.providerData?.[0]?.providerId ?? null,
    role,
    mfaEnabled: false,
    lastLogin: null,
  };
}
