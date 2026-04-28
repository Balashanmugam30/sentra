export type MarketplaceApp = {
  app_id: string;
  name: string;
  slug: string;
  vendor: string;
  category: string;
  description: string;
  logo_key: string;
  pricing_model: string;
  rating: number;
  review_count: number;
  security_verified: boolean;
  enterprise_ready: boolean;
  region_support: string[];
  install_complexity: string;
  tags: string[];
  version: string;
  monthly_price: number;
  trial_available: boolean;
  featured: boolean;
  status: string;
};

export type InstallationStatus =
  | "not_installed"
  | "installing"
  | "connected"
  | "needs_config"
  | "error"
  | "disabled"
  | "update_available";

export type MarketplaceInstallation = {
  installation_id: string;
  tenant_id: string;
  app_id: string;
  app_name: string;
  category: string;
  installed_at: string;
  installed_by: string;
  status: InstallationStatus;
  version: string;
  config_masked: Record<string, unknown>;
  last_health_check: string;
  usage_count: number;
  billing_addon_value: number;
  enabled: boolean;
  updated_at: string;
};

export type MarketplaceRecommendation = {
  recommendation_id: string;
  app_id: string;
  title: string;
  reason: string;
  estimated_impact: string;
  priority: "low" | "medium" | "high" | "critical";
  cta: string;
};

export type MarketplaceMetrics = {
  marketplace_mrr: number;
  addon_arr: number;
  avg_apps_per_tenant: number;
  top_paid_apps: Array<{ app_id: string; name: string; mrr: number; installs: number }>;
  conversion_rate: number;
  trial_to_paid_rate: number;
  partner_revenue: number;
  install_count: number;
  active_integrations: number;
  expansion_revenue: number;
};

export type MarketplaceAppsResponse = {
  apps: MarketplaceApp[];
  total: number;
};

export type MarketplaceCategoriesResponse = {
  categories: Array<{ key: string; label: string }>;
};

export type InstalledIntegrationsResponse = {
  installations: MarketplaceInstallation[];
  active_integrations: number;
  monthly_addon_value: number;
};

export type MarketplaceRecommendationsResponse = {
  recommendations: MarketplaceRecommendation[];
};

export type MarketplaceMutationResponse = {
  ok: boolean;
  message: string;
  installation?: MarketplaceInstallation | null;
  data: Record<string, unknown>;
};

export type MarketplaceSummary = {
  marketplace_arr: number;
  addon_mrr: number;
  take_rate: number;
  network_effect_score: number;
  install_count: number;
  active_integrations: number;
  featured_count: number;
  certified_count: number;
  trial_conversion_rate: number;
  active_trials: number;
  average_rating: number;
  security_approved: number;
  failed_sync_alerts: MarketplaceSyncAlert[];
  recommended_apps: MarketplaceApp[];
};

export type MarketplaceVendor = {
  vendor_id: string;
  tenant_id: string;
  name: string;
  category: string;
  support_score: number;
  revenue_generated: number;
  certification_badge: string;
  response_sla_hours: number;
  trust_score: number;
};

export type MarketplaceVendorsState = {
  vendors: MarketplaceVendor[];
  average_support_score: number;
  revenue_generated: number;
  certified_vendors: number;
  categories: Record<string, number>;
};

export type MarketplacePartner = {
  partner_id: string;
  tenant_id: string;
  name: string;
  type: string;
  region: string;
  certified_consultants: number;
  co_sell_pipeline: number;
  response_sla_hours: number;
  partner_score: number;
};

export type MarketplacePartnersState = {
  partners: MarketplacePartner[];
  co_sell_pipeline: number;
  certified_consultants: number;
  average_partner_score: number;
  types: Record<string, number>;
};

export type MarketplaceReview = {
  review_id: string;
  tenant_id: string;
  app_id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  created_at: string;
};

export type MarketplaceReviewsState = {
  reviews: MarketplaceReview[];
  average_rating: number;
  review_count: number;
  rating_distribution: Record<string, number>;
};

export type BillingAddon = {
  addon_id: string;
  tenant_id: string;
  app_id: string;
  name: string;
  mrr: number;
  status: string;
  plan_fit: string;
};

export type RevenueShare = {
  share_id: string;
  tenant_id: string;
  vendor: string;
  app_id: string;
  gross_mrr: number;
  take_rate: number;
  partner_payout: number;
  sentra_revenue: number;
};

export type MarketplaceTrial = {
  trial_id: string;
  tenant_id: string;
  app_id: string;
  stage: string;
  days_left: number;
  conversion_probability: number;
  expansion_mrr: number;
};

export type MarketplaceRevenueState = {
  addon_mrr: number;
  marketplace_arr: number;
  take_rate: number;
  partner_payouts: number;
  sentra_revenue: number;
  revenue_share: RevenueShare[];
  billing_addons: BillingAddon[];
  trials: MarketplaceTrial[];
  trial_conversion_rate: number;
  top_grossing: RevenueShare[];
};

export type MarketplaceSecurityApproval = {
  approval_id: string;
  tenant_id: string;
  app_id: string;
  trust_score: number;
  permission_risk: number;
  data_access_class: string;
  status: string;
  reviewer: string;
};

export type MarketplaceSecurityState = {
  approvals: MarketplaceSecurityApproval[];
  average_trust_score: number;
  average_permission_risk: number;
  approved: number;
  pending: number;
  data_classes: string[];
};

export type MarketplaceAutomationTemplate = {
  template_id: string;
  tenant_id: string;
  name: string;
  provider: string;
  trigger: string;
  actions: string[];
  installs: number;
  success_rate: number;
};

export type MarketplaceAutomationsState = {
  templates: MarketplaceAutomationTemplate[];
  providers: Record<string, number>;
  total_installs: number;
  average_success_rate: number;
};

export type MarketplaceSyncAlert = {
  alert_id: string;
  tenant_id: string;
  app_id: string;
  severity: string;
  title: string;
  status: string;
  last_seen: string;
};

export type MarketplaceState = {
  apps: MarketplaceAppsResponse;
  categories: MarketplaceCategoriesResponse;
  featured: MarketplaceAppsResponse;
  installed: InstalledIntegrationsResponse;
  recommendations: MarketplaceRecommendationsResponse;
  metrics: MarketplaceMetrics;
  summary: MarketplaceSummary;
  vendors: MarketplaceVendorsState;
  partners: MarketplacePartnersState;
  revenue: MarketplaceRevenueState;
  reviews: MarketplaceReviewsState;
  security: MarketplaceSecurityState;
  automations: MarketplaceAutomationsState;
  loading: boolean;
  error: string | null;
  busyAction: string | null;
  lastAction: string | null;
};

