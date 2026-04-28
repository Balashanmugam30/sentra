export type RevenueGrowthLive = {
  generated_at: string;
  visitors_month: number;
  leads: number;
  trials: number;
  paid_customers: number;
  enterprise_customers: number;
  mrr: number;
  arr: number;
  visitor_to_lead: number;
  lead_to_trial: number;
  trial_to_paid: number;
  referral_revenue: number;
  viral_coefficient: number;
  avg_cac: number;
  ltv_cac: number;
  growth_score: number;
  best_cac_channel: string;
};

export type FunnelStage = {
  stage_id: string;
  tenant_id: string;
  name: string;
  count: number;
  previous_stage_count: number | null;
  conversion_rate: number | null;
  dropoff_rate: number | null;
};

export type LeadSource = {
  source_id: string;
  tenant_id: string;
  name: string;
  leads: number;
  conversion_rate: number;
  cac: number;
  pipeline_value: number;
  status: string;
};

export type ConversionMetric = {
  metric_id: string;
  tenant_id: string;
  label: string;
  value: number;
  unit: string;
  benchmark: number;
  recommendation: string;
};

export type DemoConversion = {
  tenant_id: string;
  demo_views: number;
  demos_booked: number;
  proposals_sent: number;
  paid_closed: number;
  avg_days_to_close: number;
  close_confidence: number;
  strongest_segment: string;
};

export type ReferralProgram = {
  program_id: string;
  tenant_id: string;
  name: string;
  tier: string;
  referrals_sent: number;
  referrals_accepted: number;
  revenue_generated: number;
  top_ambassador: string;
  reward: string;
};

export type ViralLoop = {
  tenant_id: string;
  shares_per_customer: number;
  invite_conversion: number;
  organic_coefficient: number;
  growth_multiplier: number;
  loop_cycle_days: number;
  top_loop: string;
};

export type PricingExperiment = {
  experiment_id: string;
  tenant_id: string;
  name: string;
  plan: string;
  variant: string;
  conversion_rate: number;
  arpu: number;
  confidence: number;
  winner: boolean;
};

export type SalesAiAction = {
  action_id: string;
  tenant_id: string;
  title: string;
  segment: string;
  priority: string;
  expected_revenue: number;
  confidence: number;
  next_step: string;
};

export type WaitlistSignal = {
  tenant_id: string;
  people_waiting: number;
  invite_waves: number;
  top_regions: string[];
  launch_city_ranking: string[];
  top_requested_feature: string;
  expansion_heat: number;
};

export type AuthoritySignal = {
  signal_id: string;
  tenant_id: string;
  label: string;
  value: number;
  impact: string;
};

export type RevenueGrowthMutationResponse = {
  ok: boolean;
  message: string;
  data: Record<string, unknown>;
};
