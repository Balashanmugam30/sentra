export type OrgRole =
  | "owner"
  | "org_admin"
  | "security_admin"
  | "ops_admin"
  | "billing_admin"
  | "executive"
  | "operator"
  | "analyst"
  | "viewer";

export type Organization = {
  id: string;
  slug: string;
  name: string;
  industry: string;
  size: string;
  country: string;
  timezone: string;
  logo_url: string;
  primary_color: string;
  created_at: string;
  status: string;
  plan: string;
};

export type TenantPlan = {
  tenant_id: string;
  plan_name: string;
  seats_limit: number;
  modules_enabled: string[];
  api_limit: number;
  storage_limit_gb: number;
  description?: string | null;
};

export type OrganizationUser = {
  user_id: string;
  tenant_id: string;
  email: string;
  name: string;
  role: OrgRole;
  department: string;
  invited_by: string;
  joined_at: string;
  active: boolean;
  invite_token?: string | null;
  invite_expires_at?: string | null;
};

export type UsageMeter = {
  tenant_id: string;
  active_users: number;
  incidents_month: number;
  ai_actions_month: number;
  reports_generated: number;
  api_calls_month: number;
  storage_used_gb: number;
  seats_limit: number;
  seat_utilization_percent: number;
  api_utilization_percent: number;
  storage_utilization_percent: number;
};

export type BrandingPayload = {
  tenant_id: string;
  organization_name: string;
  logo_url: string;
  primary_color: string;
  pdf_report_header: string;
  email_template_signature: string;
};

export type OrgMeResponse = {
  tenant_id: string;
  organization_name: string;
  organization_slug: string;
  org_role: OrgRole;
  department: string;
  plan: TenantPlan;
  organization: Organization;
  workspaces: Organization[];
  branding: BrandingPayload;
  cache_namespace: string;
};

export type OrgUsersResponse = {
  tenant_id: string;
  users: OrganizationUser[];
};

export type OrgSettingsResponse = {
  organization: Organization;
  branding: BrandingPayload;
  security_policies: Record<string, unknown>;
  data_retention: Record<string, unknown>;
};

export type OrgPlansResponse = {
  current_plan: TenantPlan;
  plans: TenantPlan[];
};

export type OrgMutationResponse = {
  ok: boolean;
  tenant_id: string;
  message: string;
  data: Record<string, unknown>;
};

export type CreateOrgPayload = {
  name: string;
  slug: string;
  industry?: string;
  size?: string;
  country?: string;
  timezone?: string;
  plan?: "starter" | "business" | "enterprise" | "government";
};

export type InviteUserPayload = {
  email: string;
  name?: string;
  role?: OrgRole;
  department?: string;
};

export type UpdateUserRolePayload = {
  user_id: string;
  role: OrgRole;
};

export type DeactivateUserPayload = {
  user_id: string;
};

export type OrgSettingsUpdatePayload = {
  name?: string;
  industry?: string;
  size?: string;
  country?: string;
  timezone?: string;
  status?: string;
};

export type BrandingPayloadUpdate = {
  logo_url?: string;
  primary_color?: string;
  organization_name?: string;
};
