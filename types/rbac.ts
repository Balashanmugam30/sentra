export type SecurityRole =
  | "super_admin"
  | "admin"
  | "security_manager"
  | "staff"
  | "responder"
  | "analyst"
  | "guest_viewer";

export type LegacyAppRole =
  | "executive"
  | "operations_commander"
  | "communications_lead"
  | "security_lead"
  | "viewer";

export type AppRole = SecurityRole | LegacyAppRole | "guest";

export type AppPermission =
  | "dashboard.view"
  | "alerts.view"
  | "alerts.trigger"
  | "incidents.view"
  | "incidents.manage"
  | "analytics.view"
  | "analytics.executive"
  | "routes.view"
  | "routes.manage"
  | "zones.manage"
  | "staff.coordinate"
  | "tasks.update"
  | "operations.manage"
  | "governance.approve"
  | "facility.control"
  | "hardware.control"
  | "field.respond"
  | "field.manage"
  | "responder.tools"
  | "reports.view"
  | "reports.export"
  | "settings.manage"
  | "users.manage"
  | "roles.manage"
  | "system.admin";
