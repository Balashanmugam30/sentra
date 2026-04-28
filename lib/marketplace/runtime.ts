import type {
  InstalledIntegrationsResponse,
  MarketplaceAppsResponse,
  MarketplaceAutomationsState,
  MarketplaceCategoriesResponse,
  MarketplaceMetrics,
  MarketplacePartnersState,
  MarketplaceRecommendationsResponse,
  MarketplaceRevenueState,
  MarketplaceReviewsState,
  MarketplaceSecurityState,
  MarketplaceSummary,
  MarketplaceVendorsState,
} from "@/lib/marketplace/types";

export function marketplaceTone(score: number) {
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

export function marketplaceStatusTone(status: string) {
  const normalized = status.toLowerCase();
  if (["active", "connected", "approved", "converted", "healthy"].includes(normalized)) {
    return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
  }
  if (["trial", "pending", "security review", "retrying", "watch", "disabled"].includes(normalized)) {
    return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  }
  return "border-rose-300/25 bg-rose-300/10 text-rose-100";
}

const featuredApps = [
  {
    app_id: "APP-SLACK-CRISIS",
    name: "Slack Crisis Bridge",
    slug: "slack-crisis-bridge",
    vendor: "Salesforce",
    category: "communication",
    description: "Premium Slack incident rooms, command approvals, and responder escalation workflows.",
    logo_key: "slack-crisis",
    pricing_model: "per_workspace",
    rating: 4.9,
    review_count: 1540,
    security_verified: true,
    enterprise_ready: true,
    region_support: ["global"],
    install_complexity: "low",
    tags: ["chat", "crisis bridge", "incident rooms"],
    version: "4.2.0",
    monthly_price: 129,
    trial_available: true,
    featured: true,
    status: "active",
  },
  {
    app_id: "APP-GMAPS-EVAC",
    name: "Google Maps Evac Layer",
    slug: "google-maps-evac-layer",
    vendor: "Google",
    category: "maps_location",
    description: "Evacuation routing overlays, blocked corridor avoidance, and executive safe extraction paths.",
    logo_key: "gmaps-evac",
    pricing_model: "usage_based",
    rating: 4.9,
    review_count: 1460,
    security_verified: true,
    enterprise_ready: true,
    region_support: ["global"],
    install_complexity: "medium",
    tags: ["maps", "evacuation", "routes"],
    version: "5.4.0",
    monthly_price: 249,
    trial_available: true,
    featured: true,
    status: "active",
  },
];

export const fallbackApps: MarketplaceAppsResponse = { apps: featuredApps, total: featuredApps.length };
export const fallbackFeatured: MarketplaceAppsResponse = fallbackApps;
export const fallbackCategories: MarketplaceCategoriesResponse = {
  categories: [
    { key: "communication", label: "Communication" },
    { key: "maps_location", label: "Maps / Location" },
    { key: "security", label: "Security" },
    { key: "business_systems", label: "Business Systems" },
  ],
};

export const fallbackInstalled: InstalledIntegrationsResponse = {
  installations: [
    {
      installation_id: "INT-GM-SLACK",
      tenant_id: "TEN-GRAND-MERIDIAN",
      app_id: "APP-SLACK-CRISIS",
      app_name: "Slack Crisis Bridge",
      category: "communication",
      installed_at: "2026-04-26T00:00:00+00:00",
      installed_by: "system",
      status: "connected",
      version: "4.2.0",
      config_masked: { workspace: "TEN-GRAND-MERIDIAN" },
      last_health_check: "2026-04-26T00:00:00+00:00",
      usage_count: 284,
      billing_addon_value: 129,
      enabled: true,
      updated_at: "2026-04-26T00:00:00+00:00",
    },
  ],
  active_integrations: 1,
  monthly_addon_value: 129,
};

export const fallbackRecommendations: MarketplaceRecommendationsResponse = { recommendations: [] };

export const fallbackMetrics: MarketplaceMetrics = {
  marketplace_mrr: 9200,
  addon_arr: 110400,
  avg_apps_per_tenant: 3.2,
  top_paid_apps: [{ app_id: "APP-GMAPS-EVAC", name: "Google Maps Evac Layer", mrr: 12400, installs: 4 }],
  conversion_rate: 37,
  trial_to_paid_rate: 62,
  partner_revenue: 2024,
  install_count: 15,
  active_integrations: 14,
  expansion_revenue: 3128,
};

export const fallbackSummary: MarketplaceSummary = {
  marketplace_arr: 620400,
  addon_mrr: 51700,
  take_rate: 22,
  network_effect_score: 91,
  install_count: 15,
  active_integrations: 14,
  featured_count: 18,
  certified_count: 42,
  trial_conversion_rate: 62,
  active_trials: 2,
  average_rating: 4.7,
  security_approved: 2,
  failed_sync_alerts: [],
  recommended_apps: featuredApps,
};

export const fallbackVendors: MarketplaceVendorsState = {
  vendors: [],
  average_support_score: 94,
  revenue_generated: 638000,
  certified_vendors: 3,
  categories: {},
};

export const fallbackPartners: MarketplacePartnersState = {
  partners: [],
  co_sell_pipeline: 7860000,
  certified_consultants: 199,
  average_partner_score: 92,
  types: {},
};

export const fallbackRevenue: MarketplaceRevenueState = {
  addon_mrr: 36200,
  marketplace_arr: 434400,
  take_rate: 22,
  partner_payouts: 28614,
  sentra_revenue: 7586,
  revenue_share: [],
  billing_addons: [],
  trials: [],
  trial_conversion_rate: 78,
  top_grossing: [],
};

export const fallbackReviews: MarketplaceReviewsState = {
  reviews: [],
  average_rating: 4.7,
  review_count: 3,
  rating_distribution: { "5": 2, "4": 1 },
};

export const fallbackSecurity: MarketplaceSecurityState = {
  approvals: [],
  average_trust_score: 90,
  average_permission_risk: 27,
  approved: 2,
  pending: 1,
  data_classes: ["Internal", "PII", "Sensitive facility"],
};

export const fallbackAutomations: MarketplaceAutomationsState = {
  templates: [],
  providers: {},
  total_installs: 234,
  average_success_rate: 98,
};

