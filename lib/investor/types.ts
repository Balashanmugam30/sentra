export type InvestorLiveResponse = {
  generated_at: string;
  ARR: number;
  MRR: number;
  YoY_growth_percent: number;
  net_revenue_retention: number;
  gross_margin_percent: number;
  runway_months: number;
  rule_of_40: number;
  fundraising_readiness_score: number;
  base_valuation: number;
  investor_pipeline: number;
  board_pack_status: string;
};

export type InvestorRecord = {
  investor_id: string;
  tenant_id: string;
  fund_name: string;
  partner_name: string;
  check_size: number;
  stage_fit: string;
  geography: string;
  thesis_fit: string;
  warm_intro: string;
  last_meeting: string | null;
  interest_score: number;
  probability_to_invest: number;
  next_action_date: string;
  status: string;
  created_at: string;
};

export type InvestorMutationResponse = {
  ok: boolean;
  message: string;
  data: Record<string, unknown>;
};

export type InvestorSummary = {
  generated_at: string;
  ARR: number;
  MRR: number;
  growth_percent: number;
  net_revenue_retention: number;
  gross_margin_percent: number;
  burn_multiple: number;
  runway_months: number;
  rule_of_40: number;
  cash_on_hand: number;
  monthly_burn: number;
  fundraising_readiness: number;
  raise_recommendation: string;
  base_valuation: number;
  conservative_valuation: number;
  aggressive_valuation: number;
  weighted_raise: number;
  ipo_score: number;
  next_raise_deadline: string;
  investor_count: number;
};

export type InvestorStatePayload = {
  metrics: Record<string, unknown>;
  valuation: Record<string, unknown>;
  runway: Record<string, unknown>;
  captable: Record<string, unknown>;
  readiness: Record<string, unknown>;
  board: Record<string, unknown>;
  dataroom: Record<string, unknown>;
  mna: Record<string, unknown>;
  ipo: Record<string, unknown>;
  investors: InvestorRecord[];
  copilot: Record<string, unknown>;
};
