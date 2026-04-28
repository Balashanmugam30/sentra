export type EcosystemLive = {
  generated_at: string;
  installed_apps: number;
  active_integrations: number;
  marketplace_arr: number;
  api_requests_day: number;
  webhook_events_day: number;
  usage_revenue_mrr: number;
  active_developers: number;
  sdk_downloads: number;
  partners_active: number;
  partner_pipeline: number;
  partner_arr: number;
  certified_experts: number;
  training_revenue: number;
  moat_score: number;
  expansion_score: number;
  top_app_category: string;
};

export type EcosystemApp = {
  app_id: string;
  tenant_id: string;
  name: string;
  category: string;
  status: string;
  rating: number;
  installs: number;
  marketplace_arr: number;
  retention_lift: number;
  security_verified: boolean;
  featured: boolean;
  install_id?: string | null;
  sync_health?: number | null;
  installed_by?: string | null;
};

export type IntegrationHealth = {
  integration_id: string;
  tenant_id: string;
  name: string;
  category: string;
  sync_health: number;
  failed_syncs: number;
  latency_ms: number;
  token_expires_in_days: number;
  critical: boolean;
};

export type DeveloperMetrics = {
  tenant_id: string;
  api_keys: number;
  oauth_apps: number;
  sandbox_tenants: number;
  developers_active: number;
  sdk_downloads: number;
  docs_score: number;
};

export type WhiteLabelSdk = {
  tenant_id: string;
  branding_kits: number;
  embedded_widgets: number;
  tenant_oem_mode: boolean;
  sdk_access: string[];
  private_deployment_kits: number;
  partner_revenue_share_percent: number;
};

export type ApiUsage = {
  tenant_id: string;
  requests_day: number;
  webhook_events_day: number;
  avg_latency_ms: number;
  p95_latency_ms: number;
  rate_limit_blocks: number;
  top_api_customers: string[];
  usage_revenue_mrr: number;
};

export type WebhookHealth = {
  tenant_id: string;
  deliveries: number;
  retries: number;
  failures: number;
  dead_letters: number;
  success_rate: number;
  top_event_types: string[];
};

export type EcosystemPartner = {
  partner_id: string;
  tenant_id: string;
  name: string;
  partner_type: string;
  active_partners: number;
  pipeline: number;
  sourced_arr: number;
  close_rate: number;
  top_country: string;
  status: string;
};

export type CertificationTrack = {
  certification_id: string;
  tenant_id: string;
  name: string;
  certified_count: number;
  training_revenue: number;
  completion_rate: number;
  badge: string;
};

export type NetworkEffects = {
  invites_caused_by_customers: number;
  apps_causing_retention: number;
  partners_causing_deals: number;
  usage_causing_expansion: number;
  community_referrals: number;
  moat_score: number;
  expansion_score: number;
  flywheel: string[];
};

export type EcosystemRecommendation = {
  recommendation_id: string;
  title: string;
  reason: string;
  priority: string;
  estimated_impact: string;
  confidence: number;
  cta: string;
};

export type EcosystemMutationResponse = {
  ok: boolean;
  message: string;
  data: Record<string, unknown>;
};
