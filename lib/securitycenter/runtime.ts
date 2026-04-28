import type {
  SecurityAlert,
  SecurityOrg,
  SecurityRoleDefinition,
  SecurityScoreState,
  SecuritySession,
  SecuritySummary,
  SecurityUser,
} from "@/lib/securitycenter/types";

export const fallbackRoles: SecurityRoleDefinition[] = [
  { role_id: "super_admin", name: "Super Admin", tier: "platform", users: 1, permissions: ["all platform control", "tenant switching", "billing access", "AI override", "security policy"] },
  { role_id: "org_admin", name: "Org Admin", tier: "tenant", users: 0, permissions: ["manage users", "configure SSO", "billing access", "export reports", "workspace policy"] },
  { role_id: "security_manager", name: "Security Manager", tier: "operations", users: 1, permissions: ["view incidents", "approve actions", "twin control", "revoke sessions", "security audit"] },
  { role_id: "operations_lead", name: "Operations Lead", tier: "operations", users: 1, permissions: ["approve actions", "workflow control", "field dispatch", "tenant reports"] },
  { role_id: "analyst", name: "Analyst", tier: "read", users: 1, permissions: ["analytics view", "reports view", "read-only AI insights"] },
  { role_id: "operator", name: "Operator", tier: "field", users: 1, permissions: ["task updates", "incident acknowledgement", "limited zone tools"] },
  { role_id: "viewer", name: "Viewer", tier: "read", users: 1, permissions: ["limited alerts", "personal route", "read-only status"] },
];

export const fallbackUsers: SecurityUser[] = [
  { id: "USR-BALA-CEO", name: "Bala CEO", email: "bala.ceo@sentra.demo", org_id: "ORG-SMARTCITY", tenant_id: "TEN-GOVSECURE", role: "Super Admin", status: "active", department: "Executive", mfa_enabled: true, created_at: "2026-01-08T09:00:00+00:00", last_seen: "2026-04-26T08:45:00+00:00", trusted_devices: 4, risk_score: 8 },
  { id: "USR-SECURITY-ADMIN", name: "Security Admin", email: "security.admin@sentra.demo", org_id: "ORG-GRAND-MERIDIAN", tenant_id: "TEN-GRAND-MERIDIAN", role: "Security Manager", status: "active", department: "Security", mfa_enabled: true, created_at: "2026-02-02T09:00:00+00:00", last_seen: "2026-04-26T08:42:00+00:00", trusted_devices: 3, risk_score: 12 },
  { id: "USR-OPS-LEAD", name: "Ops Lead", email: "ops.lead@sentra.demo", org_id: "ORG-METROCARE", tenant_id: "TEN-BALA-HOSP", role: "Operations Lead", status: "active", department: "Operations", mfa_enabled: true, created_at: "2026-02-16T09:00:00+00:00", last_seen: "2026-04-26T08:39:00+00:00", trusted_devices: 2, risk_score: 16 },
  { id: "USR-ANALYST-1", name: "Analyst 1", email: "analyst1@sentra.demo", org_id: "ORG-NOVA-MALL", tenant_id: "TEN-BALA-MFG", role: "Analyst", status: "active", department: "Analytics", mfa_enabled: false, created_at: "2026-03-01T09:00:00+00:00", last_seen: "2026-04-26T08:20:00+00:00", trusted_devices: 1, risk_score: 38 },
  { id: "USR-NIGHT-OPERATOR", name: "Night Operator", email: "night.operator@sentra.demo", org_id: "ORG-SKYLINE", tenant_id: "TEN-BALA-UNI", role: "Operator", status: "locked", department: "Command Desk", mfa_enabled: false, created_at: "2026-03-12T09:00:00+00:00", last_seen: "2026-04-26T06:12:00+00:00", trusted_devices: 1, risk_score: 64 },
  { id: "USR-VIEWER-GUEST", name: "Viewer Guest", email: "viewer.guest@sentra.demo", org_id: "ORG-GRAND-MERIDIAN", tenant_id: "TEN-GRAND-MERIDIAN", role: "Viewer", status: "active", department: "External Audit", mfa_enabled: true, created_at: "2026-03-30T09:00:00+00:00", last_seen: "2026-04-25T19:18:00+00:00", trusted_devices: 1, risk_score: 21 },
];

export const fallbackOrgs: SecurityOrg[] = [
  { org_id: "ORG-GRAND-MERIDIAN", tenant_id: "TEN-GRAND-MERIDIAN", org_name: "Grand Meridian Hotels", tier: "Enterprise", seats_total: 820, seats_used: 642, sso_enabled: true, sso_provider: "Microsoft Entra", owner: "Security Admin", risk_score: 18, last_activity: "2026-04-26T08:42:00+00:00", billing_tier: "Enterprise" },
  { org_id: "ORG-METROCARE", tenant_id: "TEN-BALA-HOSP", org_name: "MetroCare Hospitals", tier: "Government", seats_total: 1280, seats_used: 1104, sso_enabled: true, sso_provider: "Google Workspace", owner: "Ops Lead", risk_score: 24, last_activity: "2026-04-26T08:36:00+00:00", billing_tier: "Government" },
  { org_id: "ORG-NOVA-MALL", tenant_id: "TEN-BALA-MFG", org_name: "Nova Mall Group", tier: "Growth", seats_total: 460, seats_used: 394, sso_enabled: false, sso_provider: "SSO ready", owner: "Analyst 1", risk_score: 31, last_activity: "2026-04-26T08:31:00+00:00", billing_tier: "Growth" },
  { org_id: "ORG-SKYLINE", tenant_id: "TEN-BALA-UNI", org_name: "Skyline University", tier: "Enterprise", seats_total: 900, seats_used: 768, sso_enabled: true, sso_provider: "SAML", owner: "Night Operator", risk_score: 27, last_activity: "2026-04-26T08:27:00+00:00", billing_tier: "Enterprise" },
  { org_id: "ORG-SMARTCITY", tenant_id: "TEN-GOVSECURE", org_name: "SmartCity Authority", tier: "Custom Strategic", seats_total: 1500, seats_used: 1248, sso_enabled: true, sso_provider: "Sovereign SAML", owner: "Bala CEO", risk_score: 14, last_activity: "2026-04-26T08:44:00+00:00", billing_tier: "Custom Strategic" },
];

export const fallbackSessions: SecuritySession[] = [
  { session_id: "SES-BALA-CEO-01", user_id: "USR-BALA-CEO", tenant_id: "TEN-GOVSECURE", device: "MacBook Pro", browser: "Chrome 124", region: "Chennai, IN", risk_score: 9, created_at: "2026-04-26T05:58:00+00:00", last_active: "2026-04-26T08:45:00+00:00", token_age_minutes: 167, status: "active", trusted_device: true, impossible_travel: false },
  { session_id: "SES-SEC-ADMIN-01", user_id: "USR-SECURITY-ADMIN", tenant_id: "TEN-GRAND-MERIDIAN", device: "Windows Command Tablet", browser: "Edge 124", region: "New York, US", risk_score: 18, created_at: "2026-04-26T06:12:00+00:00", last_active: "2026-04-26T08:42:00+00:00", token_age_minutes: 150, status: "active", trusted_device: true, impossible_travel: false },
  { session_id: "SES-OPS-LEAD-01", user_id: "USR-OPS-LEAD", tenant_id: "TEN-BALA-HOSP", device: "iPad Field", browser: "Safari 17", region: "Boston, US", risk_score: 22, created_at: "2026-04-26T06:18:00+00:00", last_active: "2026-04-26T08:39:00+00:00", token_age_minutes: 141, status: "active", trusted_device: true, impossible_travel: false },
  { session_id: "SES-ANALYST-01", user_id: "USR-ANALYST-1", tenant_id: "TEN-BALA-MFG", device: "Lenovo ThinkPad", browser: "Firefox 125", region: "Dubai, AE", risk_score: 42, created_at: "2026-04-25T20:10:00+00:00", last_active: "2026-04-26T08:20:00+00:00", token_age_minutes: 730, status: "watch", trusted_device: false, impossible_travel: false },
  { session_id: "SES-NIGHT-OP-01", user_id: "USR-NIGHT-OPERATOR", tenant_id: "TEN-BALA-UNI", device: "Unknown Android", browser: "Mobile Chrome", region: "Unknown VPN", risk_score: 78, created_at: "2026-04-26T02:12:00+00:00", last_active: "2026-04-26T06:12:00+00:00", token_age_minutes: 600, status: "revoked", trusted_device: false, impossible_travel: true },
];

export const fallbackAlerts: SecurityAlert[] = [
  { alert_id: "SEC-ALERT-001", tenant_id: "TEN-BALA-UNI", type: "locked_account", severity: "high", title: "Night Operator locked after repeated OTP failures", detail: "Account is contained; admin review required before unlock.", created_at: "2026-04-26T06:14:00+00:00", status: "open" },
  { alert_id: "SEC-ALERT-002", tenant_id: "TEN-BALA-MFG", type: "mfa_gap", severity: "medium", title: "Analyst 1 requires MFA enrollment", detail: "Read-only analytics access is allowed, export permissions stay blocked.", created_at: "2026-04-26T08:03:00+00:00", status: "watch" },
  { alert_id: "SEC-ALERT-003", tenant_id: "TEN-GRAND-MERIDIAN", type: "sso_health", severity: "low", title: "Microsoft Entra certificate rotation due in 18 days", detail: "No outage risk yet; schedule rotation during low traffic window.", created_at: "2026-04-26T07:41:00+00:00", status: "scheduled" },
  { alert_id: "SEC-ALERT-004", tenant_id: "TEN-GOVSECURE", type: "impossible_travel_watch", severity: "medium", title: "Sovereign workspace impossible-travel model armed", detail: "No active violation; model confidence is calibrated at 92 percent.", created_at: "2026-04-26T08:10:00+00:00", status: "healthy" },
];

export const fallbackScore: SecurityScoreState = {
  score: 88,
  grade: "Strong",
  drivers: [
    { label: "MFA adoption", value: 67, status: "watch" },
    { label: "SSO coverage", value: 80, status: "strong" },
    { label: "High-risk sessions", value: 1, status: "watch" },
    { label: "Locked accounts", value: 1, status: "watch" },
  ],
};

export const fallbackSummary: SecuritySummary = {
  active_users: 5,
  organizations: 5,
  sessions_online: 3,
  failed_logins: 2,
  mfa_coverage: 67,
  suspicious_attempts: 3,
  locked_accounts: 1,
  role_distribution: {
    "Super Admin": 1,
    "Security Manager": 1,
    "Operations Lead": 1,
    Analyst: 1,
    Operator: 1,
    Viewer: 1,
  },
  devices_trusted: 3,
  security_score: fallbackScore,
  sso_ready_orgs: 4,
  average_org_risk: 22.8,
  average_session_risk: 33.8,
  recent_alerts: fallbackAlerts,
  roles: fallbackRoles,
  auth_methods: [
    { method: "Email + Password", status: "active", coverage: 100 },
    { method: "Magic Link", status: "mock ready", coverage: 82 },
    { method: "Google SSO", status: "mock ready", coverage: 64 },
    { method: "Microsoft SSO", status: "active", coverage: 76 },
    { method: "Organization SSO", status: "ready state", coverage: 88 },
  ],
  mfa_methods: [
    { method: "Email OTP", status: "active" },
    { method: "Authenticator App", status: "mock ready" },
    { method: "Backup Codes", status: "generated on enrollment" },
    { method: "Admin Force MFA", status: "enforced" },
  ],
};

export function riskTone(score: number) {
  if (score >= 70) {
    return "border-red-300/30 bg-red-400/10 text-red-100";
  }
  if (score >= 40) {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }
  return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
}

export function statusTone(status: string) {
  if (status === "active" || status === "healthy" || status === "scheduled") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }
  if (status === "locked" || status === "revoked" || status === "open") {
    return "border-red-300/30 bg-red-400/10 text-red-100";
  }
  return "border-amber-300/30 bg-amber-300/10 text-amber-100";
}

export function formatSecurityDate(value: string) {
  if (value === "pending") {
    return "Pending";
  }
  try {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}
