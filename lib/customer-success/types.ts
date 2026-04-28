export type HealthStatus = "healthy" | "watch" | "risk" | "critical";
export type LifecycleStage = "onboarding" | "adoption" | "growth" | "renewal" | "rescue" | "expansion";

export type HealthSnapshot = {
  tenant_id: string;
  workspace_name: string;
  health_score: number;
  status: HealthStatus;
  drivers: string[];
  risks: string[];
  trend: string;
};

export type ChurnPrediction = {
  tenant_id: string;
  workspace_name: string;
  risk_percent: number;
  top_causes: string[];
  save_actions: string[];
  estimated_revenue_at_risk: number;
  severity: HealthStatus;
};

export type RenewalRecord = {
  tenant_id: string;
  workspace_name: string;
  renewal_date: string;
  days_until_renewal: number;
  bucket: string;
  renewal_probability: number;
  owner: string;
  blockers: string[];
  decision_makers: string[];
  last_touchpoint: string;
  expansion_opportunity: number;
  contract_value: number;
};

export type ExpansionOpportunity = {
  tenant_id: string;
  workspace_name: string;
  opportunity_score: number;
  expected_MRR_gain: number;
  recommended_offer: string;
  close_probability: number;
  signals: string[];
};

export type OnboardingProgress = {
  tenant_id: string;
  workspace_name: string;
  setup_complete: boolean;
  invited_users: boolean;
  first_login: boolean;
  first_report_created: boolean;
  first_AI_action_used: boolean;
  integrations_connected: boolean;
  admin_trained: boolean;
  executive_review_complete: boolean;
  time_to_value: number;
  activation_score: number;
  onboarding_health: HealthStatus;
};

export type SupportSnapshot = {
  tenant_id: string;
  workspace_name: string;
  ticket_volume: number;
  avg_resolution_time: number;
  resolution_SLA: number;
  priority_escalations: number;
  support_sentiment: string;
  NPS_score: number;
  CSAT_score: number;
};

export type CopilotAction = {
  action_id: string;
  tenant_id: string;
  workspace_name: string;
  recommendation: string;
  why: string;
  priority: "low" | "medium" | "high" | "critical";
  expected_impact: string;
  owner: string;
  due: string;
};

export type SuccessLiveResponse = {
  generated_at: string;
  NRR: number;
  health_mix: Record<HealthStatus, number>;
  at_risk_accounts: ChurnPrediction[];
  expansion_pipeline: number;
  renewals_due_90d: number;
  top_churn_reasons: string[];
  ai_save_actions: CopilotAction[];
  summary: string;
};

export type SuccessMetricsResponse = {
  NRR: number;
  gross_retention: number;
  health_average: number;
  at_risk_revenue: number;
  expansion_pipeline: number;
  renewal_pipeline: number;
  NPS_average: number;
  CSAT_average: number;
  accounts_count: number;
  lifecycle_mix: Record<string, number>;
  executive_summary: string;
};

export type HealthResponse = {
  accounts: HealthSnapshot[];
};

export type ChurnResponse = {
  predictions: ChurnPrediction[];
  revenue_at_risk: number;
  top_causes: string[];
};

export type RenewalsResponse = {
  renewals: RenewalRecord[];
  buckets: Record<string, number>;
};

export type ExpansionResponse = {
  opportunities: ExpansionOpportunity[];
  expansion_pipeline: number;
};

export type OnboardingResponse = {
  accounts: OnboardingProgress[];
};

export type SupportResponse = {
  accounts: SupportSnapshot[];
  escalations_open: number;
  avg_resolution_time: number;
};

export type CopilotResponse = {
  actions: CopilotAction[];
};

export type SuccessMutationResponse = {
  ok: boolean;
  message: string;
  data: Record<string, unknown>;
};
