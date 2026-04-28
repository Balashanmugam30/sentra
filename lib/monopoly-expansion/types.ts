export type MonopolyLive = {
  generated_at: string;
  countries_active: number;
  regions_controlled: number;
  enterprise_customers: number;
  government_contracts: number;
  partner_revenue: number;
  reseller_coverage: number;
  rfp_preferred_vendor_rate: number;
  installed_integrations: number;
  avg_switching_cost_index: string;
  partner_led_wins: number;
  referral_loop: number;
  developer_growth: number;
  data_gravity_score: number;
  monopoly_score: number;
  label: string;
  dominance_thesis: string;
};

export type AcquisitionTarget = {
  name: string;
  arr: number;
  price_multiple: number;
  strategic_fit: number;
  customer_overlap: number;
  engineering_talent: number;
  integration_ease: number;
  fit_value_score: number;
  recommended_move: string;
};

export type AcquisitionModel = {
  target: string;
  purchase_price: number;
  integration_months: number;
  customer_cross_sell: number;
  talent_retention_plan: string;
  strategic_rationale: string;
  board_recommendation: string;
};

export type StrategicPartner = {
  name: string;
  type: string;
  reach_score: number;
  revenue_potential: number;
  trust_lift: number;
  status: string;
};

export type ChannelDomination = {
  reseller_revenue: number;
  partner_coverage: number;
  procurement_pipeline: number;
  regional_distributors: number;
  coverage_map: Array<{ region: string; coverage: number; top_partner: string }>;
};

export type CountryConquest = {
  country: string;
  entered: boolean;
  readiness: number;
  legal_complexity: number;
  channel_coverage: number;
  pricing_fit: number;
};

export type GlobalConquest = {
  countries_active: number;
  regions_controlled: number;
  country_map: CountryConquest[];
  next_best_country: string;
  expansion_strategy: string;
};

export type ProcurementDefault = {
  rfp_invites: number;
  preferred_vendor_rate: number;
  repeat_bids: number;
  referenceability: number;
  default_procurement_motion: string;
  shortlist_dominance: Array<{ segment: string; preferred_rate: number }>;
};

export type ProductBundle = {
  name: string;
  attach_rate: number;
  margin: number;
  rival_pressure: number;
  annual_value: number;
};

export type CustomerLockin = {
  installed_integrations: number;
  workflows_dependent: number;
  switching_cost: string;
  seats_expanded: number;
  data_gravity_score: number;
  dependency_chart: Array<{ driver: string; score: number }>;
  responsible_note: string;
};

export type BundleEngine = {
  bundles: ProductBundle[];
  recommended_bundle: string;
  bundle_strategy: string;
  pricing_pressure_index: number;
};

export type NetworkFlywheel = {
  partner_led_wins: number;
  referral_loop: number;
  developer_growth: number;
  data_compounding: number;
  ecosystem_stickiness: number;
  flywheel: string[];
};

export type MarketConsolidation = {
  weak_rivals_identified: number;
  adjacent_markets: string[];
  share_capture_simulation: Array<{ move: string; share_gain: number; pricing_power: number; risk: string }>;
  responsible_growth_guardrail: string;
};

export type RegulatoryWatch = {
  antitrust_risk: string;
  public_trust_score: number;
  compliance_posture: number;
  procurement_fairness: number;
  data_portability: number;
  interoperability_score: number;
  risk_register: Array<{ risk: string; severity: string; mitigation: string }>;
};

export type MonopolyScore = {
  monopoly_score: number;
  label: string;
  acquisition_score: number;
  partnership_score: number;
  global_conquest_score: number;
  bundling_score: number;
  lockin_score: number;
  channel_score: number;
  procurement_default_score: number;
  network_effect_score: number;
  regulatory_health_score: number;
  posture: string;
};

export type MonopolyMutationResponse = {
  ok: boolean;
  message: string;
  data: Record<string, unknown>;
};

