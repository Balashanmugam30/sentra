export type MasterAction = {
  action_id: string;
  tenant_id: string;
  title: string;
  type: "dispatch" | "communications" | "zone_control" | "workflow" | "failover" | "recovery" | string;
  owner: string;
  priority: "critical" | "high" | "medium" | "low" | string;
  status: string;
  approval_status: string;
  eta_minutes: number;
  guardrail: string;
  confidence: number;
};

export type MasterExecution = {
  execution_id: string;
  tenant_id: string;
  action_id: string;
  status: string;
  progress: number;
  last_step: string;
  latency_ms: number;
  retry_count: number;
};

export type MasterRecovery = {
  recovery_id: string;
  tenant_id: string;
  title: string;
  score: number;
  outcome: string;
  next_action: string;
  eta_minutes: number;
};

export type MasterGuardrail = {
  guardrail_id: string;
  name: string;
  state: string;
  coverage: number;
  description: string;
};

export type MasterTenant = {
  tenant_id: string;
  name: string;
  vertical: string;
  region: string;
  plan: string;
  status: string;
  buildings: number;
  seats: number;
  users: number;
  ai_runs: number;
  notifications: number;
  storage_tb: number;
  sla_percent: number;
  mrr: number;
  arr: number;
  open_incidents: number;
  command_capacity: number;
  role_hierarchy: string[];
  last_audit: string;
};

export type MasterRegion = {
  region_id: string;
  name: string;
  tenants: number;
  active_incidents: number;
  latency_ms: number;
  sla_percent: number;
  capacity: number;
  command_nodes: number;
};

export type MasterIncident = {
  incident_id: string;
  tenant_id: string;
  title: string;
  severity: string;
  status: string;
  eta_to_stability_min: number;
  actions_linked: number;
};

export type MasterUsage = {
  usage_id: string;
  tenant_id: string;
  tenant_name: string;
  ai_runs: number;
  notifications: number;
  storage_tb: number;
  seat_utilization: number;
  quota_health: number;
};

export type MasterAuditEvent = {
  audit_id?: string;
  event_id?: string;
  tenant_id: string;
  action: string;
  actor?: string;
  result?: string;
  risk_score?: number;
  created_at: string;
  payload?: Record<string, unknown>;
};

export type MasterAutonomySummary = {
  autonomy_score: number;
  actions_ready: number;
  running_executions: number;
  awaiting_approval: number;
  retry_center: {
    failed_actions: number;
    retry_success_percent: number;
    fallback_provider: string;
    queue_pressure: number;
  };
  recovery_score: number;
  stability_eta_minutes: number;
  action_queue: MasterAction[];
  live_executions: MasterExecution[];
  recovery: MasterRecovery[];
  failover_events: { event: string; tenant: string; impact: string; confidence: number }[];
  guardrails: MasterGuardrail[];
  approval_modes: string[];
  closed_loop_outcomes: string[];
  events: MasterAuditEvent[];
};

export type MasterCloudSummary = {
  tenants_active: number;
  regions_online: number;
  buildings_managed: number;
  users_managed: number;
  ai_runs_today: number;
  notifications_today: number;
  average_sla_percent: number;
  average_command_capacity: number;
  global_incidents: MasterIncident[];
  tenants: MasterTenant[];
  regions: MasterRegion[];
  usage: MasterUsage[];
  audit: MasterAuditEvent[];
};

export type MasterRevenueRow = {
  revenue_id: string;
  tenant_id: string;
  tenant_name: string;
  mrr: number;
  arr: number;
  growth_percent: number;
  churn_risk: number;
  expansion_pipeline: number;
  renewal_days: number;
};

export type MasterForecast = {
  forecast_id: string;
  scenario: string;
  arr_12_month: number;
  growth_percent: number;
  churn_percent: number;
  enterprise_wins: number;
  confidence: number;
};

export type MasterInvestor = {
  investor_id: string;
  fund: string;
  stage: string;
  conviction: number;
  check_size: number;
  next_action: string;
  fit: string;
};

export type MasterBoardSummary = {
  arr: number;
  mrr: number;
  growth_percent: number;
  nrr: number;
  runway_months: number;
  burn_monthly: number;
  valuation_base: number;
  ipo_score: number;
  churn_forecast: number;
  expansion_pipeline: number;
  forecast: MasterForecast[];
  summary: { title: string; readiness_score: number; strategic_ask: string; top_risk: string; recommended_action: string }[];
  strategic_risks: { risk: string; severity: string; mitigation: string }[];
};

export type MasterMutationResponse = {
  ok: boolean;
  message: string;
  data: Record<string, unknown>;
};

