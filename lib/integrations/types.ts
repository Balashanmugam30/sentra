export type IntegrationProviderName =
  | "whatsapp"
  | "email"
  | "slack"
  | "teams"
  | "sms"
  | "voice"
  | "google_sheets"
  | "facility_webhook";

export type IntegrationProviderStatus =
  | "ready"
  | "standby"
  | "degraded"
  | "offline";

export type IntegrationMode = "mock" | "live" | "hub";
export type IntegrationsGlobalStatus = "healthy" | "degraded" | "critical";

export type IntegrationProviderItem = {
  name: IntegrationProviderName;
  status: IntegrationProviderStatus;
  mode: IntegrationMode;
  success_rate: number;
  last_delivery_at: string | null;
  pending_count: number;
  failed_count: number;
};

export type IntegrationQueueMetrics = {
  pending: number;
  sent: number;
  failed: number;
  retried: number;
};

export type IntegrationsLiveResponse = {
  generated_at: string;
  n8n_enabled: boolean;
  webhook_configured: boolean;
  global_status: IntegrationsGlobalStatus;
  providers: IntegrationProviderItem[];
  queue_metrics: IntegrationQueueMetrics;
  recent_events: string[];
};

export type IntegrationTestRequest = {
  provider: IntegrationProviderName;
  message: string;
};

export type IntegrationTestResponse = {
  status: string;
  provider: string;
  mode: IntegrationMode;
  receipt_id: string;
  latency_ms: number;
  n8n_triggered: boolean;
};

export type RetryFailedResponse = {
  retried_count: number;
  remaining_failed: number;
  status: string;
};

export type WebhookConfigRequest = {
  url: string;
};

export type WebhookConfigResponse = {
  status: string;
  webhook_configured: boolean;
  n8n_enabled: boolean;
};

export type IntegrationConnector = {
  connector_id: string;
  tenant_id: string;
  name: string;
  category: string;
  status: string;
  health: number;
  auth_mode: string;
  token_state: string;
  scopes: string[];
  last_sync: string;
  latency_ms: number;
  mapped_entities: number;
};

export type IntegrationSyncLog = {
  log_id: string;
  tenant_id: string;
  connector_id: string;
  status: string;
  message: string;
  latency_ms: number;
  created_at: string;
};

export type IntegrationAutomation = {
  automation_id: string;
  tenant_id: string;
  name: string;
  trigger: string;
  condition: string;
  actions: string[];
  status: string;
  runs_today: number;
  success_rate: number;
};

export type IntegrationHubSummary = {
  connectors: IntegrationConnector[];
  categories: Record<string, number>;
  connected: number;
  degraded: number;
  avg_health: number;
  avg_latency_ms: number;
  failed_integrations: IntegrationSyncLog[];
  permission_scopes: string[];
  data_mappings: { source: string; target: string; coverage: number }[];
  automations: IntegrationAutomation[];
  reliability: {
    circuit_breakers: number;
    fallback_caches: number;
    retry_queues: number;
    idempotency_keys_today: number;
  };
};

export type IntegrationHubLogs = {
  logs: IntegrationSyncLog[];
  failed: IntegrationSyncLog[];
  retrying: IntegrationSyncLog[];
  events: Array<Record<string, unknown>>;
};

export type IntegrationHubEnvelope<T> = {
  generated_at: string;
  data: T;
};

export type IntegrationHubMutationResponse = {
  ok: boolean;
  message: string;
  generated_at: string;
  data: Record<string, unknown>;
};
