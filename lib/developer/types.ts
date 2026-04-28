export type ApiKeyRecord = {
  key_id: string;
  tenant_id: string;
  label: string;
  masked_key: string;
  created_at: string;
  last_used: string | null;
  scopes: string[];
  rate_limit: number;
  status: string;
};

export type WebhookRecord = {
  webhook_id: string;
  tenant_id: string;
  endpoint: string;
  events: string[];
  status: string;
  last_delivery: string | null;
  failure_count: number;
  secret_masked: string;
  created_at: string;
};

export type OAuthAppRecord = {
  client_id: string;
  tenant_id: string;
  name: string;
  redirect_uri: string;
  owner: string;
  status: string;
  created_at: string;
};

export type EmbedWidget = {
  widget_id: string;
  tenant_id: string;
  widget_type: string;
  name: string;
  theme: string;
  allowed_domains: string[];
  refresh_interval: number;
  public_token: string;
  created_at: string;
};

export type ApiKeysResponse = {
  keys: ApiKeyRecord[];
};

export type WebhooksResponse = {
  webhooks: WebhookRecord[];
  supported_events: string[];
};

export type OAuthAppsResponse = {
  apps: OAuthAppRecord[];
};

export type DeveloperUsageResponse = {
  api_calls_month: number;
  webhook_deliveries: number;
  failed_deliveries: number;
  active_keys: number;
  active_webhooks: number;
  rate_limit_remaining: number;
  top_events: Array<{ event: string; count: number }>;
};

export type DeveloperDocsResponse = {
  base_url: string;
  auth: string;
  resources: Array<{ name: string; path: string; scopes: string[] }>;
  webhook_events: string[];
};

export type DeveloperSdkResponse = {
  sdks: Array<{ language: string; package: string; status: string }>;
  quickstart: string[];
};

export type EmbedWidgetsResponse = {
  widgets: EmbedWidget[];
};

export type DeveloperMutationResponse = {
  ok: boolean;
  message: string;
  data: Record<string, unknown>;
};

