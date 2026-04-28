import type { AppPermission, AppRole, SecurityRole } from "@/types/rbac";

import { normalizeAppRole, type OperationalScope } from "@/lib/security/roles";

export const ALL_SECURITY_PERMISSIONS: AppPermission[] = [
  "dashboard.view",
  "alerts.view",
  "alerts.trigger",
  "incidents.view",
  "incidents.manage",
  "analytics.view",
  "analytics.executive",
  "routes.view",
  "routes.manage",
  "zones.manage",
  "staff.coordinate",
  "tasks.update",
  "operations.manage",
  "governance.approve",
  "facility.control",
  "hardware.control",
  "field.respond",
  "field.manage",
  "responder.tools",
  "reports.view",
  "reports.export",
  "settings.manage",
  "users.manage",
  "roles.manage",
  "system.admin",
];

export const ROLE_PERMISSIONS: Record<SecurityRole, AppPermission[]> = {
  super_admin: ALL_SECURITY_PERMISSIONS,
  admin: [
    "dashboard.view",
    "alerts.view",
    "alerts.trigger",
    "incidents.view",
    "incidents.manage",
    "analytics.view",
    "analytics.executive",
    "routes.view",
    "routes.manage",
    "operations.manage",
    "governance.approve",
    "reports.view",
    "reports.export",
    "settings.manage",
    "users.manage",
  ],
  security_manager: [
    "dashboard.view",
    "alerts.view",
    "alerts.trigger",
    "incidents.view",
    "incidents.manage",
    "routes.view",
    "routes.manage",
    "zones.manage",
    "staff.coordinate",
    "operations.manage",
    "governance.approve",
    "facility.control",
    "hardware.control",
    "field.respond",
    "field.manage",
    "responder.tools",
    "reports.view",
    "reports.export",
  ],
  staff: [
    "dashboard.view",
    "alerts.view",
    "incidents.view",
    "routes.view",
    "tasks.update",
    "field.respond",
  ],
  responder: [
    "dashboard.view",
    "alerts.view",
    "incidents.view",
    "routes.view",
    "field.respond",
    "responder.tools",
  ],
  analyst: [
    "dashboard.view",
    "alerts.view",
    "incidents.view",
    "analytics.view",
    "reports.view",
    "reports.export",
  ],
  guest_viewer: ["dashboard.view", "alerts.view", "routes.view"],
};

export function getPermissionsForRole(role: AppRole | string | null | undefined) {
  return ROLE_PERMISSIONS[normalizeAppRole(role)];
}

export function hasPermission(
  role: AppRole | string | null | undefined,
  permission: AppPermission,
  explicitPermissions?: readonly AppPermission[],
) {
  const permissions = explicitPermissions?.length ? explicitPermissions : getPermissionsForRole(role);
  return permissions.includes(permission);
}

export function hasAnyPermission(
  role: AppRole | string | null | undefined,
  permissions: AppPermission[],
  explicitPermissions?: readonly AppPermission[],
) {
  return permissions.some((permission) => hasPermission(role, permission, explicitPermissions));
}

export function canViewIncidents(role: AppRole | string | null | undefined) {
  return hasPermission(role, "incidents.view");
}

export function canTriggerAlerts(role: AppRole | string | null | undefined) {
  return hasPermission(role, "alerts.trigger");
}

export function canManageUsers(role: AppRole | string | null | undefined) {
  return hasAnyPermission(role, ["users.manage", "roles.manage", "system.admin"]);
}

export function canAccessResponderTools(role: AppRole | string | null | undefined) {
  return hasAnyPermission(role, ["responder.tools", "field.manage"]);
}

export function canViewAnalytics(role: AppRole | string | null | undefined) {
  return hasPermission(role, "analytics.view");
}

export function canAccessScope(
  role: AppRole | string | null | undefined,
  requested: { building?: string | null; zone?: string | null },
  scope?: OperationalScope | null,
) {
  const normalized = normalizeAppRole(role);
  if (normalized === "super_admin" || normalized === "admin") {
    return true;
  }

  if (!scope) {
    return normalized !== "staff";
  }

  const buildingAllowed =
    !requested.building ||
    !scope.buildings?.length ||
    scope.buildings.includes(requested.building);
  const zoneAllowed =
    !requested.zone || !scope.zones?.length || scope.zones.includes(requested.zone);

  return buildingAllowed && zoneAllowed;
}
