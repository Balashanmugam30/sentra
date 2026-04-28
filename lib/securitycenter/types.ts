export type SecurityDriver = {
  label: string;
  value: number;
  status: "strong" | "watch";
};

export type SecurityScoreState = {
  score: number;
  grade: string;
  drivers: SecurityDriver[];
};

export type SecurityAlert = {
  alert_id: string;
  tenant_id: string;
  type: string;
  severity: "low" | "medium" | "high";
  title: string;
  detail: string;
  created_at: string;
  status: string;
};

export type SecurityRoleDefinition = {
  role_id: string;
  name: string;
  tier: string;
  users: number;
  permissions: string[];
};

export type AuthMethod = {
  method: string;
  status: string;
  coverage: number;
};

export type MfaMethod = {
  method: string;
  status: string;
};

export type SecuritySummary = {
  active_users: number;
  organizations: number;
  sessions_online: number;
  failed_logins: number;
  mfa_coverage: number;
  suspicious_attempts: number;
  locked_accounts: number;
  role_distribution: Record<string, number>;
  devices_trusted: number;
  security_score: SecurityScoreState;
  sso_ready_orgs: number;
  average_org_risk: number;
  average_session_risk: number;
  recent_alerts: SecurityAlert[];
  roles: SecurityRoleDefinition[];
  auth_methods: AuthMethod[];
  mfa_methods: MfaMethod[];
};

export type SecurityUser = {
  id: string;
  name: string;
  email: string;
  org_id: string;
  tenant_id: string;
  role: string;
  status: "active" | "invited" | "locked" | "disabled";
  department: string;
  mfa_enabled: boolean;
  created_at: string;
  last_seen: string;
  trusted_devices: number;
  risk_score: number;
  invite_method?: string;
  mfa_reset_required?: boolean;
};

export type SecurityOrg = {
  org_id: string;
  tenant_id: string;
  org_name: string;
  tier: string;
  seats_total: number;
  seats_used: number;
  sso_enabled: boolean;
  sso_provider: string;
  owner: string;
  risk_score: number;
  last_activity: string;
  billing_tier: string;
};

export type SecuritySession = {
  session_id: string;
  user_id: string;
  tenant_id: string;
  device: string;
  browser: string;
  region: string;
  risk_score: number;
  created_at: string;
  last_active: string;
  token_age_minutes: number;
  status: "active" | "watch" | "revoked";
  trusted_device: boolean;
  impossible_travel: boolean;
};

export type SecurityMutationResponse = {
  ok: boolean;
  message: string;
  data: Record<string, unknown>;
};

export type SecurityCenterState = {
  summary: SecuritySummary;
  users: SecurityUser[];
  orgs: SecurityOrg[];
  sessions: SecuritySession[];
  roles: SecurityRoleDefinition[];
  loading: boolean;
  error: string | null;
  busyAction: string | null;
  lastAction: string | null;
};
