import type { AppPermission, AppRole } from "@/types/rbac";

import { hasAnyPermission, hasPermission } from "@/lib/security/permissions";
import { normalizeAppRole } from "@/lib/security/roles";

export type RouteAccessRule = {
  path: string;
  roles?: AppRole[];
  permissions?: AppPermission[];
};

export const PROTECTED_ROUTE_RULES: RouteAccessRule[] = [
  { path: "/admin", permissions: ["users.manage", "roles.manage", "system.admin"] },
  { path: "/ai", roles: ["super_admin", "admin", "security_manager", "security_lead", "analyst"] },
  { path: "/audit", roles: ["super_admin", "admin", "security_manager", "security_lead"] },
  { path: "/behavior", roles: ["super_admin", "admin", "security_manager", "security_lead", "analyst", "responder", "executive", "operations_commander"] },
  { path: "/dashboard", permissions: ["dashboard.view"] },
  { path: "/app", permissions: ["dashboard.view"] },
  { path: "/investor", roles: ["super_admin", "admin", "executive", "operations_commander"] },
  { path: "/iot", roles: ["super_admin", "admin", "security_manager", "security_lead"] },
  { path: "/mobile/staff", roles: ["staff", "security_manager", "admin", "super_admin"] },
  { path: "/mobile/responder", roles: ["responder", "security_manager", "admin", "super_admin"] },
  { path: "/operations", roles: ["super_admin", "admin", "security_manager", "security_lead"] },
  { path: "/platform", roles: ["super_admin", "admin"] },
  { path: "/analytics", permissions: ["analytics.view"] },
  { path: "/security", roles: ["super_admin", "admin", "security_manager", "security_lead"] },
  { path: "/settings", permissions: ["settings.manage"] },
];

export function getRouteRule(pathname: string) {
  return PROTECTED_ROUTE_RULES.find(
    (rule) => pathname === rule.path || pathname.startsWith(`${rule.path}/`),
  );
}

export function canAccessRoute(
  pathname: string,
  context: {
    role?: AppRole | string | null;
    permissions?: AppPermission[];
    authenticated?: boolean;
  },
) {
  const rule = getRouteRule(pathname);
  if (!rule) {
    return true;
  }
  if (!context.authenticated) {
    return false;
  }

  const role = normalizeAppRole(context.role);
  const roleAllowed = !rule.roles?.length || rule.roles.includes(role);
  const permissionAllowed =
    !rule.permissions?.length ||
    hasAnyPermission(role, rule.permissions, context.permissions) ||
    rule.permissions.some((permission) => hasPermission(role, permission));

  return roleAllowed && permissionAllowed;
}

export function getUnauthorizedRedirect(pathname: string, authenticated: boolean) {
  if (!authenticated) {
    return `/login?from=${encodeURIComponent(pathname)}`;
  }

  return "/unauthorized";
}
