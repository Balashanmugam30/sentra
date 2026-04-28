export type OpsAlertSeverity = "low" | "warning" | "critical";

export interface OpsAlert {
  alert_id: string;
  severity: OpsAlertSeverity;
  title: string;
  description: string;
  recommended_action: string;
  created_at: string;
}

export interface DeepHealthCheck {
  status: string;
  [key: string]: unknown;
}

export interface OpsObservabilitySnapshot {
  generated_at: string;
  deployment: {
    version: string;
    environment: string;
    release_channel: string;
    commit_sha: string;
  };
  uptime_seconds: number;
  active_nodes: number;
  health: {
    status: string;
    checks: Record<string, DeepHealthCheck>;
    latency: {
      p50: number;
      p95: number;
      p99: number;
    };
    requests_last_min: number;
    errors_last_window: number;
  };
  alerts: OpsAlert[];
  backup: {
    status: string;
    retention_days: number;
    last_successful_backup: string;
  };
  database: {
    status: string;
    size_mb: number;
    pooling: string;
  };
  cache: {
    status: string;
    entries: number;
    hit_ratio: number;
    singleflight_waits: number;
  };
  queue: {
    depth: number;
    status: string;
  };
  metrics: {
    requests_last_min: number;
    websocket_clients: number;
    latency: {
      p50: number;
      p95: number;
      p99: number;
    };
    errors_last_window: number;
  };
  release: {
    strategy: string;
    rollback_ready: boolean;
    smoke_test_command: string;
  };
}

export type OpsTaskStatus = "queued" | "running" | "blocked" | "awaiting_approval" | "completed";
export type OpsSlaStatus = "healthy" | "watch" | "breached";

export interface OpsExecutionScenario {
  scenario_id: string;
  label: string;
}

export interface OpsIncident {
  incident_id: string;
  title: string;
  building: string;
  zone: string;
  severity: string;
  workflow: string;
  recovery_eta: string;
  status: string;
  confidence: number;
}

export interface OpsWorkflow {
  workflow_id: string;
  name: string;
  incident_id: string;
  scenario: string;
  status: string;
  progress: number;
  tasks_total: number;
  tasks_completed: number;
  owner: string;
  started_at: string;
}

export interface OpsTask {
  task_id: string;
  title: string;
  role: string;
  owner: string;
  eta: string;
  sla_minutes: number;
  elapsed_minutes: number;
  sla_status: OpsSlaStatus;
  status: OpsTaskStatus;
  dependencies: string[];
  confidence: number;
  notes: string;
}

export type OpsTaskBoard = Record<OpsTaskStatus, OpsTask[]>;

export interface OpsSlaTimer {
  task_id: string;
  title: string;
  owner: string;
  remaining_minutes: number;
  sla_status: OpsSlaStatus;
  escalation_level: number;
}

export interface OpsTeam {
  department: string;
  capacity: number;
  load: number;
  readiness: number;
  lead: string;
  status: string;
}

export interface OpsBlocker {
  blocker_id: string;
  task_id: string;
  title: string;
  risk: string;
  owner: string;
  recommended_action: string;
}

export interface OpsEscalation {
  escalation_id: string;
  level: number;
  task_id: string;
  title: string;
  action: string;
  owner: string;
}

export interface OpsApproval {
  approval_id: string;
  task_id: string;
  title: string;
  owner: string;
  risk_score: number;
  recommendation: string;
}

export interface OpsResolutionEvent {
  timestamp: string;
  event: string;
  detail: string;
  status: string;
}

export interface OpsExecutionSnapshot {
  generated_at: string;
  mode: "demo" | "live" | "hybrid" | string;
  scenarios: OpsExecutionScenario[];
  active_incidents: OpsIncident[];
  workflow_queue: OpsWorkflow[];
  tasks: OpsTask[];
  task_board: OpsTaskBoard;
  sla_timers: OpsSlaTimer[];
  teams: OpsTeam[];
  blockers: OpsBlocker[];
  escalation_queue: OpsEscalation[];
  approval_center: OpsApproval[];
  completion: {
    progress: number;
    tasks_completed: number;
    tasks_total: number;
    resolution_confidence: number;
  };
  governance: {
    mode: string;
    available_modes: string[];
    actions: string[];
  };
  resolution_ledger: OpsResolutionEvent[];
  executive_summary: {
    incidents_active: number;
    avg_response_time: string;
    tasks_completed: number;
    sla_success: string;
    estimated_losses_avoided: string;
    recovery_eta: string;
    running_tasks: number;
  };
  close_result?: {
    incident_id: string;
    closed: boolean;
    gates: Record<string, boolean>;
  };
}

export type OpsApprovalRisk = "low" | "medium" | "high" | "critical";
export type OpsApprovalStatus = "pending" | "approved" | "auto_approved" | "rejected" | "escalated";

export interface OpsGovernanceScenario {
  scenario_id: string;
  label: string;
}

export interface OpsApprovalRoute {
  decision: string;
  approver: string;
  rationale: string;
}

export interface OpsGovernanceApproval {
  approval_id: string;
  title: string;
  action_type: string;
  risk_level: OpsApprovalRisk;
  risk_score: number;
  required_approval: "auto" | "manager" | "executive" | "dual" | string;
  assigned_to: string;
  backup_approver: string;
  sla_minutes: number;
  pending_minutes: number;
  sla_remaining_minutes: number;
  impact: string;
  evidence: string[];
  priority_score: number;
  workflow: string;
  status: OpsApprovalStatus;
  delegated_to?: string | null;
  route: OpsApprovalRoute;
}

export interface OpsApprovalSla {
  approval_id: string;
  title: string;
  remaining_minutes: number;
  status: "watch" | "breached" | string;
  assigned_to: string;
}

export interface OpsGovernanceEscalation {
  escalation_id: string;
  approval_id: string;
  title: string;
  level: number;
  current_owner: string;
  next_owner: string;
  reason: string;
  fallback: string;
}

export interface OpsRoleWorkload {
  role: string;
  pending: number;
  approvals_per_hour: number;
  avg_decision_time: string;
  load: number;
  bottleneck: boolean;
}

export interface OpsDelegationOption {
  delegation_id: string;
  from: string;
  to: string;
  coverage: string;
  status: string;
  load_delta: string;
}

export interface OpsAutomationAction {
  action_id: string;
  title: string;
  connector: string;
  system: string;
  status: string;
  risk_level: OpsApprovalRisk;
  last_attempt: string;
  retries: number;
  next_retry: string;
  fallback: string;
  success_rate: number;
}

export interface OpsRetryProvider {
  provider: string;
  status: string;
  queued: number;
  failed: number;
  p95_latency: string;
  failover_ready: boolean;
}

export interface OpsGovernanceAnalytics {
  auto_approval_percent: number;
  avg_approval_time: string;
  escalations_avoided: number;
  workflows_completed: number;
  governance_efficiency: number;
  response_acceleration: string;
}

export interface OpsGovernanceTrust {
  decisions_governed: number;
  unsafe_actions_blocked: number;
  audit_completeness: string;
  trust_score: number;
  autonomy_maturity: string;
}

export interface OpsEvidenceRecord {
  evidence_id: string;
  title: string;
  source: string;
  completeness: number;
  hash: string;
}

export interface OpsGovernanceSnapshot {
  generated_at: string;
  mode: "demo" | "live" | "hybrid" | string;
  scenarios: OpsGovernanceScenario[];
  pending_approvals: OpsGovernanceApproval[];
  priority_queue: OpsGovernanceApproval[];
  sla_to_approve: OpsApprovalSla[];
  auto_approved_actions: OpsGovernanceApproval[];
  escalated_decisions: OpsGovernanceEscalation[];
  role_workload: OpsRoleWorkload[];
  delegations: OpsDelegationOption[];
  automation: OpsAutomationAction[];
  retry_health: OpsRetryProvider[];
  analytics: OpsGovernanceAnalytics;
  trust: OpsGovernanceTrust;
  evidence: OpsEvidenceRecord[];
  ledger: OpsResolutionEvent[];
  summary: {
    pending_count: number;
    critical_count: number;
    approved_count: number;
    automation_ready: number;
    escalation_count: number;
  };
}

export type OpsCommsChannelId =
  | "in_app"
  | "email"
  | "sms"
  | "whatsapp"
  | "slack"
  | "teams"
  | "webhook"
  | "voice"
  | string;

export interface OpsCommsScenario {
  scenario_id: string;
  label: string;
}

export interface OpsCommsChannelMetric {
  channel: OpsCommsChannelId;
  label: string;
  queued: number;
  sent: number;
  delivered: number;
  failed: number;
  retried: number;
  acked: number;
  success_rate: number;
}

export interface OpsCommsAudience {
  audience_id: string;
  label: string;
  count: number;
  scope: string;
  risk: string;
}

export interface OpsCommsTemplate {
  template_id: string;
  title: string;
  severity: string;
  body: string;
  recommended_channels: OpsCommsChannelId[];
}

export interface OpsCommsZoneStatus {
  zone: string;
  building: string;
  acknowledged: number;
  silent: number;
  help_requests: number;
  trapped: number;
  evacuation_complete: number;
  risk: string;
}

export interface OpsSilenceEscalation {
  escalation_id: string;
  target: string;
  silent_count: number;
  last_channel: string;
  next_action: string;
  priority: string;
  owner: string;
}

export interface OpsCommsAnalytics {
  delivery_success_percent: number;
  avg_ack_time: string;
  silent_user_percent: number;
  escalations_triggered: number;
  help_requests_handled: number;
  channel_performance: Array<{
    channel: string;
    success_rate: number;
    acked: number;
  }>;
  zone_response_ranking: Array<{
    zone: string;
    acknowledged: number;
    evacuation_complete: number;
  }>;
}

export interface OpsCommsTrust {
  population_reached: number;
  board_visibility: string;
  public_risk_lowered: string;
  communication_confidence: number;
  accountability_score: number;
}

export interface OpsCommunicationsSnapshot {
  generated_at: string;
  mode: "demo" | "live" | "hybrid" | string;
  scenario: string;
  scenarios: OpsCommsScenario[];
  composer: {
    default_template_id: string;
    default_audience_id: string;
    default_channels: OpsCommsChannelId[];
    severity: string;
  };
  channels: OpsCommsChannelMetric[];
  audiences: OpsCommsAudience[];
  templates: OpsCommsTemplate[];
  response_counts: {
    safe: number;
    need_help: number;
    trapped: number;
    evacuated: number;
    on_route: number;
    acknowledged: number;
    silent: number;
  };
  status_map: OpsCommsZoneStatus[];
  silence_escalations: OpsSilenceEscalation[];
  feed: OpsResolutionEvent[];
  analytics: OpsCommsAnalytics;
  trust: OpsCommsTrust;
  ledger: OpsResolutionEvent[];
  summary: {
    active_broadcasts: number;
    population_reached: number;
    acknowledged: number;
    need_help: number;
    trapped: number;
    silent: number;
    delivery_success_percent: number;
  };
}

export interface OpsResourceIncident {
  incident_id: string;
  title: string;
  building: string;
  zone: string;
  severity: string;
  required_skill: string;
  urgency: number;
}

export interface OpsResourceTeam {
  unit_id: string;
  name: string;
  skills: string[];
  location: string;
  availability: string;
  workload: number;
  fatigue_score: number;
  zone_familiarity: number;
  eta_minutes: number;
}

export interface OpsInventoryItem {
  item_id: string;
  name: string;
  category: string;
  ready: number;
  deployed: number;
  maintenance: number;
  missing: number;
  low_stock: boolean;
  state: string;
}

export interface OpsVehicle {
  vehicle_id: string;
  name: string;
  type: string;
  status: string;
  eta_minutes: number;
  route: string;
  blocked_route: boolean;
  reroute: string;
}

export interface OpsReserveUnit {
  reserve_id: string;
  name: string;
  available: number;
  activation_eta: string;
  recommended: boolean;
}

export interface OpsMissionAssignment {
  assignment_id: string;
  incident_id: string;
  incident: string;
  unit_id: string;
  unit: string;
  eta_minutes: number;
  confidence: number;
  rationale: string;
  status: string;
}

export interface OpsShortageAlert {
  alert_id: string;
  title: string;
  severity: string;
  owner: string;
  recommendation: string;
}

export interface OpsFatigueRecord {
  unit: string;
  active_hours: number;
  fatigue_score: number;
  overload_risk: string;
  recommended_swap: boolean;
}

export interface OpsResourcesSnapshot {
  generated_at: string;
  mode: "demo" | "live" | "hybrid" | string;
  live_incidents: OpsResourceIncident[];
  deployment_map: OpsMissionAssignment[];
  teams: OpsResourceTeam[];
  inventory: OpsInventoryItem[];
  vehicles: OpsVehicle[];
  reserves: OpsReserveUnit[];
  eta_board: OpsMissionAssignment[];
  shortage_alerts: OpsShortageAlert[];
  fatigue: OpsFatigueRecord[];
  mission_assignments: OpsMissionAssignment[];
  ledger: OpsResolutionEvent[];
  summary: {
    active_incidents: number;
    units_available: number;
    equipment_ready: number;
    vehicles_active: number;
    reserve_units: number;
    avg_eta_minutes: number;
    shortages: number;
    readiness_score: number;
  };
}

export interface OpsRecoveryScenario {
  scenario_id: string;
  label: string;
}

export interface OpsDamageAssessment {
  area: string;
  damage: string;
  severity: string;
  estimated_loss: string;
  clearance_eta: string;
}

export interface OpsRecoveryTask {
  task_id: string;
  title: string;
  owner: string;
  stage: string;
  status: string;
  progress: number;
  approval_required: boolean;
}

export interface OpsReopenGate {
  gate_id: string;
  title: string;
  required_for: string;
  risk: string;
  status: string;
  evidence: string;
}

export interface OpsVendorRecord {
  vendor_id: string;
  name: string;
  scope: string;
  eta: string;
  status: string;
  confidence: number;
}

export interface OpsOccupancyWave {
  wave: string;
  scope: string;
  capacity: number;
  eta: string;
  status: string;
}

export interface OpsRecoverySnapshot {
  generated_at: string;
  mode: "demo" | "live" | "hybrid" | string;
  scenario: string;
  scenarios: OpsRecoveryScenario[];
  damage_assessment: OpsDamageAssessment[];
  tasks: OpsRecoveryTask[];
  hazard_clearance: OpsRecoveryTask[];
  utilities_restore: OpsRecoveryTask[];
  compliance_checks: OpsRecoveryTask[];
  reopen_checklist: OpsReopenGate[];
  insurance_tasks: OpsRecoveryTask[];
  vendor_coordination: OpsVendorRecord[];
  occupancy_return_plan: OpsOccupancyWave[];
  ledger: OpsResolutionEvent[];
  kpis: {
    time_to_contain: string;
    time_to_reopen: string;
    losses_reduced: string;
    continuity_score: number;
    readiness_score: number;
    recovery_progress: number;
    rooms_reopenable: number;
    vendors_active: number;
  };
  summary: {
    active_tasks: number;
    awaiting_approval: number;
    reopen_gates_ready: number;
    progress: number;
  };
}

export interface OpsSystemHealthRecord {
  module: string;
  status: string;
  score: number;
  latency_ms: number;
  owner: string;
}

export interface OpsApiFailure {
  route: string;
  failures: number;
  last_error: string;
  owner: string;
  status: string;
}

export interface OpsQueuePressure {
  queue: string;
  depth: number;
  pressure: number;
  status: string;
}

export interface OpsCircuitBreaker {
  breaker: string;
  state: string;
  trip_count: number;
  fallback: string;
}

export interface OpsRetryEngineRecord {
  provider: string;
  attempts: number;
  backoff: string;
  success_rate: number;
}

export interface OpsWorkflowFailure {
  workflow_id: string;
  task: string;
  reason: string;
  recovery_action: string;
}

export interface OpsAutoHealAction {
  action_id: string;
  title: string;
  target: string;
  risk: string;
  impact: string;
  confidence: number;
  status: string;
}

export interface OpsLatencyRecord {
  service: string;
  p50: number;
  p95: number;
  p99: number;
}

export interface OpsIntegrationHealth {
  integration: string;
  status: string;
  uptime: number;
  last_recovery: string;
}

export interface OpsFailureForecast {
  risk_id: string;
  title: string;
  risk_score: number;
  eta_to_failure: string;
  driver: string;
  recommendation: string;
}

export interface OpsResilienceSnapshot {
  generated_at: string;
  mode: "demo" | "live" | "hybrid" | string;
  system_health: OpsSystemHealthRecord[];
  api_failures: OpsApiFailure[];
  queue_pressure: OpsQueuePressure[];
  circuit_breakers: OpsCircuitBreaker[];
  retry_engine: OpsRetryEngineRecord[];
  workflow_failures: OpsWorkflowFailure[];
  recovery_timeline: OpsResolutionEvent[];
  auto_heal_actions: OpsAutoHealAction[];
  latency_radar: OpsLatencyRecord[];
  integration_health: OpsIntegrationHealth[];
  failure_forecast: OpsFailureForecast[];
  trust_ledger: OpsResolutionEvent[];
  summary: {
    health_score: number;
    systems_degraded: number;
    auto_heal_ready: number;
    auto_healed: number;
    collapse_risk: number;
    uptime_protection: string;
  };
}

export interface OpsExecutiveRisk {
  risk_id: string;
  title: string;
  severity: string;
  owner: string;
  mitigation: string;
}

export interface OpsFinancialExposure {
  current: string;
  avoidable: string;
  burn_rate_per_hour: string;
  insured_recovery: string;
}

export interface OpsReputationExposure {
  score: number;
  public_risk: string;
  media_pressure: string;
  customer_confidence: number;
}

export interface OpsTeamUtilization {
  team: string;
  utilization: number;
  status: string;
}

export interface OpsSlaHealthSummary {
  success_rate: number;
  breached: number;
  watch: number;
  healthy: number;
}

export interface OpsCeoAction {
  action_id: string;
  label: string;
  plan: string;
  confidence: number;
}

export interface OpsStrategyOption {
  option_id: string;
  label: string;
  cost: string;
  downtime: string;
  risk: number;
  recovery_time: string;
  reputation_impact: string;
}

export interface OpsExecutionTunerRecord {
  lever: string;
  current: string;
  optimized: string;
  gain: string;
}

export interface OpsBoardSummary {
  headline: string;
  talking_points: string[];
  export_ready: boolean;
}

export interface OpsDemoStoryStep {
  step: number;
  title: string;
  metric: string;
  status: string;
}

export interface OpsExecutiveSnapshot {
  generated_at: string;
  mode: "demo" | "live" | "hybrid" | string;
  readiness_score: number;
  active_risks: OpsExecutiveRisk[];
  financial_exposure: OpsFinancialExposure;
  reputation_exposure: OpsReputationExposure;
  recovery_eta: string;
  teams_utilization: OpsTeamUtilization[];
  sla_health: OpsSlaHealthSummary;
  ceo_actions: OpsCeoAction[];
  selected_action: OpsCeoAction;
  strategy_options: OpsStrategyOption[];
  selected_simulation: OpsStrategyOption;
  execution_tuner: OpsExecutionTunerRecord[];
  board_summary: OpsBoardSummary;
  demo_story: OpsDemoStoryStep[];
  trust_ledger: OpsResolutionEvent[];
  summary: {
    operational_readiness: number;
    active_risks: number;
    financial_exposure: string;
    reputation_score: number;
    recovery_eta: string;
    sla_success: number;
    board_confidence: number;
  };
}
