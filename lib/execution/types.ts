export type ExecutionLiveResponse = {
  generated_at: string;
  ARR: number;
  MRR: number;
  growth_percent: number;
  cash_balance: number;
  monthly_burn: number;
  runway_months: number;
  employees: number;
  countries: number;
  NPS: number;
  gross_margin_percent: number;
  LTV_CAC: number;
  board_readiness: number;
  CEO_confidence: number;
  execution_score: number;
};

export type ExecutionMutationResponse = {
  ok: boolean;
  message: string;
  data: Record<string, unknown>;
};

export type ExecutionStatePayload = {
  ceo: Record<string, unknown>;
  coo: Record<string, unknown>;
  cfo: Record<string, unknown>;
  cro: Record<string, unknown>;
  chro: Record<string, unknown>;
  ciso: Record<string, unknown>;
  council: Record<string, unknown>;
  board: Record<string, unknown>;
  scenarios: Record<string, unknown>;
  productivity: Record<string, unknown>;
  workflows: Record<string, unknown>;
  simulate: Record<string, unknown>;
  efficiency: Record<string, unknown>;
};
