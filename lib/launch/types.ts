export type LaunchDesignAudit = {
  audit_id: string;
  tenant_id: string;
  area: string;
  score: number;
  status: string;
  checks: string[];
  finding: string;
};

export type LaunchPerformanceRoute = {
  route: string;
  p95_ms: number;
  status: string;
  cache: string;
  chunk_kb: number;
  owner: string;
};

export type LaunchQualityCheck = {
  check_id: string;
  name: string;
  severity: string;
  status: string;
  count: number;
  detail: string;
};

export type LaunchReadinessDimension = {
  dimension: string;
  score: number;
  status: string;
  evidence: string;
};

export type LaunchOpsSignal = {
  signal_id: string;
  label: string;
  value: number;
  unit: string;
  status: string;
  detail: string;
};

export type LaunchPreference = {
  pref_id: string;
  name: string;
  options: string[];
  default: string;
};

export type LaunchExecutiveAction = {
  action_id: string;
  title: string;
  impact: string;
  urgency: string;
};

export type LaunchSummary = {
  launch_score: number;
  status: string;
  positioning: string;
  performance_score: number;
  quality_score: number;
  design_score: number;
  design_audits: LaunchDesignAudit[];
  top_actions: LaunchExecutiveAction[];
  preferences: LaunchPreference[];
  launch_language: string[];
};

export type LaunchPerformance = {
  performance_score: number;
  avg_route_p95_ms: number;
  routes: LaunchPerformanceRoute[];
  slow_components: { name: string; cost_ms: number; fix: string }[];
  api_latency: { p50_ms: number; p95_ms: number; error_rate: number };
  cache: { hit_ratio: number; dedupe_saves_today: number; stale_while_revalidate: boolean };
  websocket: { connected_clients: number; health_percent: number; reconnects_today: number };
  hydration: { average_ms: number; largest_route_ms: number; status: string };
  optimizations: string[];
};

export type LaunchQuality = {
  quality_score: number;
  open_items: number;
  checks: LaunchQualityCheck[];
  scanner: {
    routes_scanned: number;
    broken_routes: number;
    console_errors: number;
    failed_apis: number;
    auth_loops: number;
    type_mismatches: number;
  };
  degraded_mode: string;
};

export type LaunchReadiness = {
  launch_score: number;
  dimensions: LaunchReadinessDimension[];
  feature_completeness: number;
  route_coverage: number;
  trust_readiness: number;
  compliance_readiness: number;
  investor_readiness: number;
  demo_readiness: number;
  submission_readiness: number;
  recommendation: string;
};

export type LaunchExecutive = {
  readiness_score: number;
  arr: number;
  trust_score: number;
  global_health: number;
  top_threats: { title: string; severity: string; owner: string }[];
  top_next_actions: LaunchExecutiveAction[];
  board_summary: string[];
  export_cta: { label: string; status: string; format: string };
};

export type LaunchOps = {
  ops_score: number;
  live_errors: number;
  uptime_percent: number;
  background_jobs: number;
  queue_depth: number;
  retries_today: number;
  degraded_services: string[];
  signals: LaunchOpsSignal[];
  alert_history: { alert_id: string; title: string; status: string; severity: string }[];
};

export type LaunchEnvelope<T> = {
  generated_at: string;
  data: T;
};

export type LaunchMutationResponse = {
  ok: boolean;
  message: string;
  generated_at: string;
  data: Record<string, unknown>;
};
