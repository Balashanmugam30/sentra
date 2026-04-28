export type GrowthRegion = {
  region_id: string;
  tenant_id: string;
  name: string;
  status: string;
  regional_hq: string;
  countries_live: number;
  pipeline_arr: number;
  owner: string;
};

export type GrowthCountry = {
  country_id: string;
  tenant_id: string;
  name: string;
  region: string;
  currency: string;
  market_score: number;
  compliance_complexity: number;
  sales_cycle_days: number;
  ARR_potential: number;
  competition_index: number;
  channel_strength: number;
  government_opportunity: number;
  deployment_readiness: number;
  status: string;
  launched_at: string | null;
};

export type GrowthTerritory = {
  territory_id: string;
  tenant_id: string;
  name: string;
  country: string;
  vertical_focus: string;
  cities: string;
  ARR_potential: number;
  pipeline_arr: number;
  owner: string;
  score: number;
  coverage_status: string;
};

export type GrowthPartner = {
  partner_id: string;
  tenant_id: string;
  name: string;
  partner_type: string;
  country_coverage: string[];
  pipeline_influenced: number;
  ARR_closed: number;
  commission_due: number;
  certification_score: number;
  win_rate: number;
  status: string;
};

export type GrowthContract = {
  contract_id: string;
  tenant_id: string;
  account_name: string;
  country: string;
  deal_type: string;
  stage: string;
  value: number;
  probability: number;
  expected_close_date: string;
  owner: string;
  risk: string;
  competitors: string[];
  created_at: string;
};

export type GrowthPricing = {
  pricing_id: string;
  tenant_id: string;
  country: string;
  plan: string;
  currency: string;
  local_monthly: number;
  local_annual: number;
  usd_equivalent_monthly: number;
  tax_percent: number;
  discount_band_percent: number;
  partner_commission_percent: number;
  premium_uplift_percent: number;
};

export type WhiteLabelProgram = {
  franchise_id: string;
  tenant_id: string;
  name: string;
  partner_name: string;
  custom_domain: string;
  custom_logo: string;
  custom_theme: string;
  reseller_owned_billing: boolean;
  regional_hosting_tag: string;
  language_pack: string;
  status: string;
  created_at: string;
};

export type ExpansionRecommendation = {
  recommendation_id: string;
  title: string;
  reason: string;
  impact: string;
  priority: string;
  confidence: number;
  cta: string;
};

export type GrowthLiveResponse = {
  generated_at: string;
  countries_live: number;
  regions_active: number;
  pipeline_arr: number;
  closed_arr: number;
  open_government_deals: number;
  partners_active: number;
  launches_this_quarter: number;
  expansion_score: number;
  best_market: string;
  fastest_win_cycle: string;
  highest_ticket_size: string;
};

export type GrowthStateResponse = {
  regions: GrowthRegion[];
  countries: GrowthCountry[];
  territories: GrowthTerritory[];
  partners: GrowthPartner[];
  contracts: GrowthContract[];
  pricing: GrowthPricing[];
  programs: WhiteLabelProgram[];
  recommendations: ExpansionRecommendation[];
  forecast: Record<string, unknown>;
  pipeline: Record<string, unknown>;
};

export type GrowthMutationResponse = {
  ok: boolean;
  message: string;
  data: Record<string, unknown>;
};

export type SalesDeal = {
  deal_id: string;
  company: string;
  arr_value: number;
  owner: string;
  stage: string;
  probability: number;
  next_step: string;
  risk_flags: string[];
  expected_close_date: string;
  source: string;
  industry: string;
  notes: string[];
};

export type LeadScore = {
  lead_id: string;
  company: string;
  source: string;
  industry: string;
  company_size: number;
  urgency: number;
  industry_fit: number;
  budget_signal: number;
  geography: string;
  engagement_score: number;
  security_need: number;
  buying_intent: number;
  ai_score: number;
  recommended_action: string;
};

export type FunnelStageMetric = {
  stage: string;
  count: number;
  conversion_rate: number;
  dropoff_rate: number;
  revenue_value: number;
};

export type ChannelRoi = {
  source: string;
  visitors: number;
  leads: number;
  cpl: number;
  cac: number;
  close_rate: number;
  roi: number;
  pipeline_value: number;
};

export type CustomerHealth = {
  customer_id: string;
  customer: string;
  status: string;
  adoption_score: number;
  seats_used: number;
  seats_purchased: number;
  support_tickets: number;
  sentiment: string;
  renewal_date: string;
  arr: number;
  expansion_potential: number;
  risk_score: number;
  nps: number;
  csat: number;
  next_success_action: string;
};

export type RenewalSignal = {
  renewal_id: string;
  customer: string;
  due_bucket: string;
  renewal_date: string;
  arr: number;
  risk: string;
  owner: string;
  recommended_playbook: string;
};

export type ExpansionOpportunity = {
  opportunity_id: string;
  customer: string;
  type: string;
  potential_arr: number;
  confidence: number;
  trigger: string;
  next_action: string;
};

export type RepPerformance = {
  rep: string;
  pipeline: number;
  weighted_forecast: number;
  closed_arr: number;
  attainment: number;
  win_rate: number;
};

export type GtmSummary = {
  generated_at: string;
  pipeline_value: number;
  weighted_forecast: number;
  visitors: number;
  leads: number;
  demos_booked_percent: number;
  sql_percent: number;
  close_percent: number;
  cac: number;
  cpl: number;
  viral_coefficient: number;
  renewal_pipeline: number;
  expansion_pipeline: number;
  churn_risk_accounts: number;
  customer_health_score: number;
  quarter_forecast: number;
  best_case: number;
  worst_case: number;
};

export type FunnelAnalytics = {
  stages: FunnelStageMetric[];
  channels: ChannelRoi[];
  referral_engine: {
    referrals_sent: number;
    accepted: number;
    revenue_generated: number;
    viral_coefficient: number;
    best_ambassador: string;
  };
  leaks: string[];
};

export type GrowthForecastingResponse = {
  forecast: Record<string, unknown>;
  reps: RepPerformance[];
};
