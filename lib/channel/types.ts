export type ChannelEnvelope<T> = {
  generated_at: string;
  data: T;
};

export type ChannelMutationResponse = {
  ok: boolean;
  message: string;
  generated_at: string;
  data: Record<string, unknown>;
};

export type ChannelSummary = {
  channel_score: number;
  partner_arr: number;
  white_label_arr: number;
  oem_commitment: number;
  weighted_pipeline: number;
  active_partners: number;
  reseller_mrr: number;
  countries_ready: number;
  next_best_country: string;
  launch_readiness_average: number;
  blocked_countries: BlockedCountry[];
  strategic_ai: string[];
  scorecards: ExpansionScorecard[];
};

export type ChannelPartner = {
  partner_id: string;
  tenant_id: string;
  name: string;
  type: string;
  region: string;
  countries: string[];
  tier: string;
  status: string;
  support_grade: string;
  certification_level: string;
  support_sla_hours: number;
  pipeline_arr: number;
  partner_arr: number;
  score: number;
};

export type ChannelTier = {
  tier_id: string;
  name: string;
  min_arr: number;
  commission_rate: number;
  support_sla_hours: number;
  benefits: string[];
};

export type FranchiseOperator = {
  operator_id: string;
  name: string;
  country: string;
  city_exclusivity: string;
  managed_deployments: number;
  onboarding_score: number;
  arr: number;
  potential_arr: number;
  status: string;
};

export type ChannelPartnersState = {
  partners: ChannelPartner[];
  tiers: ChannelTier[];
  franchise_operators: FranchiseOperator[];
  active: number;
  pipeline_arr: number;
  coverage_countries: string[];
  coverage_gaps: string[];
};

export type ChannelReseller = {
  reseller_id: string;
  name: string;
  country: string;
  tier: string;
  mrr: number;
  commission_rate: number;
  commission_due: number;
  open_deals: number;
  seats_under_management: number;
  status: string;
};

export type ChannelResellersState = {
  resellers: ChannelReseller[];
  reseller_mrr: number;
  commission_due: number;
  open_deals: number;
  tiers: Record<string, number>;
};

export type WhiteLabelBrand = {
  brand_id: string;
  name: string;
  client: string;
  region: string;
  custom_domain: string;
  theme: string;
  language_packs: string[];
  license_seats: number;
  licensing_arr: number;
  status: string;
  domain_status: string;
};

export type WhiteLabelState = {
  brands: WhiteLabelBrand[];
  active_brands: number;
  licensing_arr: number;
  license_seats: number;
  language_packs: string[];
};

export type OemContract = {
  oem_id: string;
  name: string;
  sector: string;
  partner: string;
  annual_commitment: number;
  seats: number;
  api_embedded_usage: number;
  revenue_model: string;
  status: string;
  renewal: string;
};

export type OemState = {
  contracts: OemContract[];
  annual_commitment: number;
  seats: number;
  api_embedded_usage: number;
  active: number;
};

export type ChannelCountry = {
  country_id: string;
  name: string;
  region: string;
  readiness_score: number;
  legal_complexity: number;
  pricing_fit: number;
  partner_coverage: number;
  procurement_readiness: number;
  language_readiness: number;
  status: string;
  blocked: boolean;
  next_action: string;
};

export type BlockedCountry = {
  block_id: string;
  country: string;
  reason: string;
  severity: string;
  review_date: string;
};

export type LegalReadiness = {
  legal_id: string;
  country: string;
  privacy_ready: number;
  procurement_ready: number;
  data_residency: string;
  contract_pack: string;
};

export type CountriesState = {
  countries: ChannelCountry[];
  blocked: BlockedCountry[];
  legal_readiness: LegalReadiness[];
  average_readiness: number;
  next_launch: ChannelCountry[];
};

export type PartnerRevenue = {
  revenue_id: string;
  partner_id: string;
  country: string;
  arr: number;
  mrr: number;
  commission_due: number;
  payout_status: string;
  take_rate: number;
  forecast_arr: number;
};

export type Commission = {
  commission_id: string;
  partner_id: string;
  amount: number;
  status: string;
  due_at: string;
  paid_at: string | null;
};

export type ChannelRevenueState = {
  partner_revenue: PartnerRevenue[];
  commissions: Commission[];
  partner_arr: number;
  partner_mrr: number;
  commission_due: number;
  forecast_arr: number;
  regional_winners: PartnerRevenue[];
};

export type RegionalPipeline = {
  pipeline_id: string;
  region: string;
  country: string;
  segment: string;
  stage: string;
  weighted_arr: number;
  probability: number;
  next_step: string;
  owner: string;
};

export type ChannelPipelineState = {
  pipeline: RegionalPipeline[];
  weighted_forecast: number;
  stage_mix: Record<string, number>;
  high_probability: RegionalPipeline[];
};

export type Certification = {
  certification_id: string;
  partner_id: string;
  name: string;
  level: string;
  trained_staff: number;
  score: number;
  expires_at: string;
  status: string;
};

export type CertificationsState = {
  certifications: Certification[];
  trained_staff: number;
  active: number;
  average_score: number;
};

export type RegionalPricing = {
  pricing_id: string;
  country: string;
  currency: string;
  base_platform_mrr: number;
  per_site_mrr: number;
  partner_margin: number;
  pricing_fit: number;
  status: string;
};

export type PricingState = {
  pricing: RegionalPricing[];
  legal_readiness: LegalReadiness[];
  average_pricing_fit: number;
  approved_regions: number;
};

export type ExpansionScorecard = {
  scorecard_id: string;
  country: string;
  expansion_score: number;
  next_best_action: string;
  weak_signal: string;
};

export type ChannelState = {
  summary: ChannelSummary;
  partners: ChannelPartnersState;
  resellers: ChannelResellersState;
  whitelabel: WhiteLabelState;
  oem: OemState;
  countries: CountriesState;
  revenue: ChannelRevenueState;
  pipeline: ChannelPipelineState;
  certifications: CertificationsState;
  pricing: PricingState;
  loading: boolean;
  error: string | null;
  busyAction: string | null;
  lastAction: string | null;
};

