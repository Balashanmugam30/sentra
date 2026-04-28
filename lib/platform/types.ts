export type PlatformOpsLive = {
  liveness: Record<string, unknown>;
  readiness: Record<string, unknown>;
  launch: {
    score?: number;
    status?: string;
    dimensions?: Record<string, number>;
    checks?: Array<Record<string, unknown>>;
  };
  alerts: {
    alerts?: Array<Record<string, unknown>>;
    session_anomalies?: Record<string, unknown>;
  };
  telemetry: Record<string, unknown>;
};

export type PlatformOpsState = {
  live: PlatformOpsLive | null;
  errors: Record<string, unknown> | null;
  performance: Record<string, unknown> | null;
  deployment: Record<string, unknown> | null;
  dataIntegrity: Record<string, unknown> | null;
  billingReconciliation: Record<string, unknown> | null;
};

export type PlatformOrganization = {
  tenant_id: string;
  name: string;
  plan: string;
  region: string;
  developer_tier: string;
  owner: string;
  sandbox_enabled: boolean;
};

export type PlatformApiKey = {
  key_id: string;
  tenant_id: string;
  name: string;
  masked_key: string;
  environment: "production" | "sandbox" | "hybrid" | string;
  scopes: string[];
  status: "active" | "revoked" | string;
  last_used: string;
  expires_at: string;
  created_by: string;
  requests_today: number;
  rate_limit: string;
};

export type PlatformOAuthApp = {
  app_id: string;
  tenant_id: string;
  name: string;
  client_id: string;
  environment: string;
  scopes: string[];
  redirect_urls: string[];
  status: "active" | "security_review" | "revoked" | string;
  owner: string;
  connected_users: number;
  last_authorized: string;
};

export type PlatformWebhook = {
  webhook_id: string;
  tenant_id: string;
  name: string;
  endpoint_url: string;
  events: string[];
  status: "active" | "degraded" | "disabled" | string;
  signature_status: "verified" | "rotated" | string;
  latency_ms: number;
  success_rate: number;
  retry_count: number;
  failures_today: number;
  last_delivery: string;
};

export type PlatformDelivery = {
  delivery_id: string;
  tenant_id: string;
  webhook_id: string;
  event: string;
  status: string;
  attempts: number;
  latency_ms: number;
  created_at: string;
};

export type PlatformUsageLog = {
  log_id: string;
  tenant_id: string;
  endpoint: string;
  method: string;
  status: number;
  requests: number;
  latency_ms: number;
  day: string;
  environment: string;
};

export type PlatformRateLimit = {
  tenant_id: string;
  plan: string;
  per_minute: number;
  per_day: number;
  burst_mode: boolean;
  blocked_requests: number;
  abuse_score: number;
  usage_percent: number;
  status: string;
};

export type PlatformDeveloper = {
  developer_id: string;
  tenant_id: string;
  name: string;
  email: string;
  role: string;
  apps_owned: number;
  last_active: string;
  docs_views: number;
  sandbox_runs: number;
};

export type PlatformEnvironment = {
  environment_id: string;
  tenant_id: string;
  name: string;
  mode: string;
  keys: number;
  events_today: number;
  health: number;
};

export type PlatformSdkPackage = {
  sdk_id: string;
  tenant_id: string;
  name: string;
  language: string;
  version: string;
  downloads: number;
  status: string;
  example: string;
};

export type PlatformAlert = {
  alert_id: string;
  tenant_id: string;
  title: string;
  severity: "low" | "medium" | "high" | string;
  status: string;
  detail: string;
};

export type PlatformDoc = {
  doc_id: string;
  tenant_id: string;
  title: string;
  section: string;
  views: number;
  status: string;
};

export type PlatformSandboxEvent = {
  event_id: string;
  tenant_id: string;
  name: string;
  payload: Record<string, unknown>;
  status: string;
};

export type PlatformAuditEvent = {
  event_id: string;
  tenant_id: string;
  action: string;
  payload: Record<string, unknown>;
  created_at: string;
  chain_hash: string;
};

export type PlatformSummary = {
  developer_ecosystem_score: number;
  active_developers: number;
  apps_created: number;
  docs_usage: number;
  sdk_downloads: number;
  builder_growth_percent: number;
  active_api_keys: number;
  webhook_success_rate: number;
  sandbox_runs: number;
  alerts: PlatformAlert[];
  environments: PlatformEnvironment[];
  organizations: PlatformOrganization[];
};

export type PlatformApiKeysState = {
  keys: PlatformApiKey[];
  active: number;
  revoked: number;
  environments: Record<string, number>;
  scope_catalog: string[];
};

export type PlatformAppsState = {
  apps: PlatformOAuthApp[];
  active: number;
  security_review: number;
  connected_users: number;
  scopes: string[];
};

export type PlatformWebhooksState = {
  webhooks: PlatformWebhook[];
  deliveries: PlatformDelivery[];
  active: number;
  degraded: number;
  failed_deliveries: number;
  avg_latency_ms: number;
  signature_verified: number;
};

export type PlatformUsageState = {
  daily_requests: number;
  monthly_requests: number;
  top_endpoints: { endpoint: string; requests: number }[];
  top_customers: { name: string; requests: number }[];
  error_percent: number;
  avg_latency_ms: number;
  p95_latency_ms: number;
  revenue_potential: number;
  upgrade_suggestions: string[];
  logs: PlatformUsageLog[];
};

export type PlatformRateLimitState = {
  limits: PlatformRateLimit[];
  blocked_requests: number;
  average_usage_percent: number;
  abuse_watch: PlatformRateLimit[];
};

export type PlatformLogsState = {
  usage_logs: PlatformUsageLog[];
  audit_events: PlatformAuditEvent[];
  deliveries: PlatformDelivery[];
};

export type PlatformSdksState = {
  packages: PlatformSdkPackage[];
  total_downloads: number;
  ready_languages: string[];
  rest_examples: PlatformSdkPackage[];
};

export type PlatformDocsState = {
  docs: PlatformDoc[];
  published: number;
  views: number;
  openapi_ready: boolean;
  sections: Record<string, number>;
};

export type PlatformSandboxState = {
  events: PlatformSandboxEvent[];
  test_keys_enabled: boolean;
  fake_events_enabled: boolean;
  mock_incidents: string[];
  payload_generator: string;
  safe_mode: boolean;
};

export type PlatformMutationResponse = {
  ok: boolean;
  message: string;
  data: Record<string, unknown>;
};

export type PlatformState = {
  summary: PlatformSummary;
  apiKeys: PlatformApiKeysState;
  apps: PlatformAppsState;
  webhooks: PlatformWebhooksState;
  usage: PlatformUsageState;
  rateLimits: PlatformRateLimitState;
  logs: PlatformLogsState;
  sdks: PlatformSdksState;
  docs: PlatformDocsState;
  sandbox: PlatformSandboxState;
  loading: boolean;
  error: string | null;
  busyAction: string | null;
  lastAction: string | null;
};

