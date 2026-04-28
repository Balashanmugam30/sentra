import type {
  PlatformApiKeysState,
  PlatformAppsState,
  PlatformDocsState,
  PlatformLogsState,
  PlatformRateLimitState,
  PlatformSandboxState,
  PlatformSdksState,
  PlatformSummary,
  PlatformUsageState,
  PlatformWebhooksState,
} from "@/lib/platform/types";

export function platformTone(score: number) {
  if (score >= 90) {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }
  if (score >= 75) {
    return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
  }
  if (score >= 55) {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }
  return "border-rose-300/30 bg-rose-300/10 text-rose-100";
}

export function platformStatusTone(status: string) {
  const normalized = status.toLowerCase();
  if (["active", "healthy", "delivered", "ready", "published"].includes(normalized)) {
    return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
  }
  if (["degraded", "watch", "near_cap", "security_review", "retried"].includes(normalized)) {
    return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  }
  return "border-rose-300/25 bg-rose-300/10 text-rose-100";
}

export const fallbackSummary: PlatformSummary = {
  developer_ecosystem_score: 91,
  active_developers: 3,
  apps_created: 3,
  docs_usage: 1024,
  sdk_downloads: 4620,
  builder_growth_percent: 34,
  active_api_keys: 3,
  webhook_success_rate: 97.4,
  sandbox_runs: 63,
  alerts: [
    {
      alert_id: "PLAT-ALT-001",
      tenant_id: "TEN-BALA-UNI",
      title: "Campus API usage at 81% of plan",
      severity: "medium",
      status: "open",
      detail: "Recommend Enterprise burst add-on before admissions event.",
    },
  ],
  environments: [
    {
      environment_id: "ENV-PROD",
      tenant_id: "TEN-GRAND-MERIDIAN",
      name: "Production",
      mode: "live",
      keys: 4,
      events_today: 31420,
      health: 98,
    },
    {
      environment_id: "ENV-SBX",
      tenant_id: "TEN-BALA-HOSP",
      name: "Sandbox",
      mode: "test",
      keys: 2,
      events_today: 8240,
      health: 95,
    },
  ],
  organizations: [
    {
      tenant_id: "TEN-GRAND-MERIDIAN",
      name: "Grand Meridian Hotels",
      plan: "Enterprise",
      region: "APAC",
      developer_tier: "Scale",
      owner: "Bala CEO",
      sandbox_enabled: true,
    },
    {
      tenant_id: "TEN-BALA-HOSP",
      name: "Bala Hospital Demo",
      plan: "Government",
      region: "India South",
      developer_tier: "Regulated",
      owner: "Security Admin",
      sandbox_enabled: true,
    },
  ],
};

export const fallbackApiKeys: PlatformApiKeysState = {
  keys: [
    {
      key_id: "KEY-GM-PROD",
      tenant_id: "TEN-GRAND-MERIDIAN",
      name: "Grand Meridian production ingest",
      masked_key: "sk_live_gm_********4A9F",
      environment: "production",
      scopes: ["incidents:read", "alerts:write", "webhooks:read"],
      status: "active",
      last_used: "2026-04-26T07:52:00+00:00",
      expires_at: "2026-10-26T00:00:00+00:00",
      created_by: "Security Admin",
      requests_today: 18420,
      rate_limit: "12k/min",
    },
    {
      key_id: "KEY-HOSP-SBX",
      tenant_id: "TEN-BALA-HOSP",
      name: "Hospital sandbox automation",
      masked_key: "sk_test_hosp_********91CD",
      environment: "sandbox",
      scopes: ["sandbox:write", "incidents:simulate", "webhooks:test"],
      status: "active",
      last_used: "2026-04-26T06:34:00+00:00",
      expires_at: "2026-07-26T00:00:00+00:00",
      created_by: "Ops Lead",
      requests_today: 6420,
      rate_limit: "5k/min",
    },
  ],
  active: 2,
  revoked: 0,
  environments: { production: 1, sandbox: 1 },
  scope_catalog: ["alerts:write", "incidents:read", "sandbox:write", "webhooks:read", "webhooks:test"],
};

export const fallbackApps: PlatformAppsState = {
  apps: [
    {
      app_id: "APP-N8N-OPS",
      tenant_id: "TEN-GRAND-MERIDIAN",
      name: "n8n Emergency Automation",
      client_id: "sentra_app_n8n_ops",
      environment: "production",
      scopes: ["workflows:run", "alerts:send", "audit:read"],
      redirect_urls: ["https://ops.grandmeridian.demo/oauth/callback"],
      status: "active",
      owner: "Grand Meridian Hotels",
      connected_users: 18,
      last_authorized: "2026-04-25T22:20:00+00:00",
    },
    {
      app_id: "APP-HOSP-EMR",
      tenant_id: "TEN-BALA-HOSP",
      name: "Hospital EMR Safety Bridge",
      client_id: "sentra_app_hosp_emr",
      environment: "production",
      scopes: ["communications:send", "incidents:read"],
      redirect_urls: ["https://metrocare.demo/sentra/oauth"],
      status: "security_review",
      owner: "Bala Hospital Demo",
      connected_users: 6,
      last_authorized: "2026-04-24T10:10:00+00:00",
    },
  ],
  active: 1,
  security_review: 1,
  connected_users: 24,
  scopes: ["alerts:send", "audit:read", "communications:send", "incidents:read", "workflows:run"],
};

export const fallbackWebhooks: PlatformWebhooksState = {
  webhooks: [
    {
      webhook_id: "WH-GM-INCIDENTS",
      tenant_id: "TEN-GRAND-MERIDIAN",
      name: "Incident lifecycle stream",
      endpoint_url: "https://hooks.grandmeridian.demo/sentra/incidents",
      events: ["incident.created", "workflow.completed", "audit.denied"],
      status: "active",
      signature_status: "verified",
      latency_ms: 142,
      success_rate: 99.2,
      retry_count: 1,
      failures_today: 0,
      last_delivery: "2026-04-26T08:04:00+00:00",
    },
    {
      webhook_id: "WH-HOSP-COMMS",
      tenant_id: "TEN-BALA-HOSP",
      name: "Clinical escalation webhook",
      endpoint_url: "https://integrations.metrocaredemo.org/sentra/escalations",
      events: ["communications.failed", "medical.assistance"],
      status: "degraded",
      signature_status: "verified",
      latency_ms: 420,
      success_rate: 94.6,
      retry_count: 4,
      failures_today: 3,
      last_delivery: "2026-04-26T07:58:00+00:00",
    },
  ],
  deliveries: [
    {
      delivery_id: "DLV-0001",
      tenant_id: "TEN-GRAND-MERIDIAN",
      webhook_id: "WH-GM-INCIDENTS",
      event: "incident.created",
      status: "delivered",
      attempts: 1,
      latency_ms: 118,
      created_at: "2026-04-26T08:04:00+00:00",
    },
  ],
  active: 1,
  degraded: 1,
  failed_deliveries: 3,
  avg_latency_ms: 281,
  signature_verified: 2,
};

export const fallbackUsage: PlatformUsageState = {
  daily_requests: 31440,
  monthly_requests: 880320,
  top_endpoints: [
    { endpoint: "/v1/twin/live", requests: 9280 },
    { endpoint: "/v1/incidents", requests: 8240 },
    { endpoint: "/v1/alerts", requests: 6120 },
  ],
  top_customers: [
    { name: "Grand Meridian Hotels", requests: 14360 },
    { name: "Bala University", requests: 9280 },
    { name: "Bala Hospital Demo", requests: 2400 },
  ],
  error_percent: 0,
  avg_latency_ms: 148,
  p95_latency_ms: 204,
  revenue_potential: 184000,
  upgrade_suggestions: [
    "Campus API usage is near Growth plan cap; recommend Enterprise burst add-on.",
    "Hospital webhook retries justify regulated integration support tier.",
  ],
  logs: [],
};

export const fallbackRateLimits: PlatformRateLimitState = {
  limits: [
    {
      tenant_id: "TEN-GRAND-MERIDIAN",
      plan: "Enterprise",
      per_minute: 12000,
      per_day: 2400000,
      burst_mode: true,
      blocked_requests: 0,
      abuse_score: 8,
      usage_percent: 72,
      status: "healthy",
    },
    {
      tenant_id: "TEN-BALA-UNI",
      plan: "Growth",
      per_minute: 6000,
      per_day: 900000,
      burst_mode: false,
      blocked_requests: 0,
      abuse_score: 6,
      usage_percent: 81,
      status: "near_cap",
    },
  ],
  blocked_requests: 0,
  average_usage_percent: 77,
  abuse_watch: [],
};

export const fallbackLogs: PlatformLogsState = {
  usage_logs: [],
  audit_events: [],
  deliveries: fallbackWebhooks.deliveries,
};

export const fallbackSdks: PlatformSdksState = {
  packages: [
    {
      sdk_id: "SDK-JS",
      tenant_id: "TEN-GRAND-MERIDIAN",
      name: "Sentra JavaScript SDK",
      language: "TypeScript",
      version: "0.7.4",
      downloads: 1840,
      status: "ready",
      example: "sentra.incidents.create(payload)",
    },
    {
      sdk_id: "SDK-PY",
      tenant_id: "TEN-BALA-HOSP",
      name: "Sentra Python SDK",
      language: "Python",
      version: "0.6.8",
      downloads: 1220,
      status: "ready",
      example: "client.incidents.create(payload)",
    },
  ],
  total_downloads: 3060,
  ready_languages: ["Python", "TypeScript"],
  rest_examples: [],
};

export const fallbackDocs: PlatformDocsState = {
  docs: [
    {
      doc_id: "DOC-AUTH",
      tenant_id: "TEN-GRAND-MERIDIAN",
      title: "Authentication and API keys",
      section: "security",
      views: 420,
      status: "published",
    },
  ],
  published: 1,
  views: 420,
  openapi_ready: true,
  sections: { security: 1 },
};

export const fallbackSandbox: PlatformSandboxState = {
  events: [
    {
      event_id: "SBX-INCIDENT",
      tenant_id: "TEN-GRAND-MERIDIAN",
      name: "mock incident.created",
      payload: { type: "fire", severity: 82, zone: "Kitchen B" },
      status: "ready",
    },
  ],
  test_keys_enabled: true,
  fake_events_enabled: true,
  mock_incidents: ["fire", "gas_leak", "panic", "webhook_failure"],
  payload_generator: "deterministic",
  safe_mode: true,
};

