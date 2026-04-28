import type { AppRole, SecurityRole } from "@/types/rbac";

export type OperationalScope = {
  buildings?: string[];
  zones?: string[];
};

export const SECURITY_ROLES: SecurityRole[] = [
  "super_admin",
  "admin",
  "security_manager",
  "staff",
  "responder",
  "analyst",
  "guest_viewer",
];

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  security_manager: "Security Manager",
  staff: "Staff",
  responder: "Responder",
  analyst: "Analyst",
  guest_viewer: "Guest Viewer",
  executive: "Executive",
  operations_commander: "Operations Commander",
  communications_lead: "Communications Lead",
  security_lead: "Security Lead",
  viewer: "Viewer",
  guest: "Guest",
};

export const ROLE_DESCRIPTIONS: Record<SecurityRole, string> = {
  super_admin: "Full platform control across tenants, users, roles, systems, and emergency actions.",
  admin: "Building administration, alerts, users, settings, and operational reports.",
  security_manager: "Incidents, routes, zones, staff coordination, and security operations.",
  staff: "Assigned-zone missions, task updates, and field coordination support.",
  responder: "Tactical incident access, rescue missions, ingress routes, and responder tools.",
  analyst: "Read-only analytics, reports, and incident intelligence review.",
  guest_viewer: "Personal route guidance and limited alert visibility.",
};

export const ROLE_TIERS: Record<AppRole, "tier_1" | "tier_2" | "tier_3" | "tier_4"> = {
  super_admin: "tier_1",
  admin: "tier_2",
  security_manager: "tier_2",
  staff: "tier_3",
  responder: "tier_3",
  analyst: "tier_3",
  guest_viewer: "tier_4",
  executive: "tier_2",
  operations_commander: "tier_2",
  communications_lead: "tier_3",
  security_lead: "tier_2",
  viewer: "tier_4",
  guest: "tier_4",
};

export const ROLE_ALIASES: Record<string, SecurityRole> = {
  super_admin: "super_admin",
  admin: "admin",
  security_manager: "security_manager",
  staff: "staff",
  responder: "responder",
  analyst: "analyst",
  guest_viewer: "guest_viewer",
  executive: "admin",
  operations_commander: "security_manager",
  communications_lead: "staff",
  security_lead: "security_manager",
  viewer: "guest_viewer",
  guest: "guest_viewer",
  operator: "security_manager",
};

export const DEMO_AUTH_CREDENTIALS = [
  {
    email: "admin@sentra.demo",
    password: "SentraDemo!2026",
    role: "admin" as const,
    label: "Admin Console",
  },
  {
    email: "manager@sentra.demo",
    password: "SentraDemo!2026",
    role: "security_manager" as const,
    label: "Security Manager",
  },
  {
    email: "staff@sentra.demo",
    password: "SentraDemo!2026",
    role: "staff" as const,
    label: "Staff Mode",
  },
  {
    email: "responder@sentra.demo",
    password: "SentraDemo!2026",
    role: "responder" as const,
    label: "Responder Mode",
  },
  {
    email: "analyst@sentra.demo",
    password: "SentraDemo!2026",
    role: "analyst" as const,
    label: "Analyst View",
  },
];

export function normalizeAppRole(role: string | null | undefined): SecurityRole {
  if (!role) {
    return "guest_viewer";
  }

  return ROLE_ALIASES[role.trim().toLowerCase()] ?? "guest_viewer";
}

export function getRoleLabel(role: string | null | undefined) {
  const normalized = role?.trim().toLowerCase() as AppRole | undefined;
  if (normalized && ROLE_LABELS[normalized]) {
    return ROLE_LABELS[normalized];
  }

  return ROLE_LABELS[normalizeAppRole(role)];
}
