import type { MasterAction, MasterAutonomySummary, MasterBoardSummary, MasterCloudSummary, MasterInvestor, MasterRevenueRow } from "@/lib/master/types";

export const fallbackActions: MasterAction[] = [
  { action_id: "ACT-DISPATCH-001", tenant_id: "TEN-GRAND-MERIDIAN", title: "Dispatch responders to Kitchen B", type: "dispatch", owner: "Ops Alpha", priority: "critical", status: "running", approval_status: "approved", eta_minutes: 3, guardrail: "life_safety_first", confidence: 96 },
  { action_id: "ACT-COMMS-002", tenant_id: "TEN-GRAND-MERIDIAN", title: "Send floor 3 guided evacuation broadcast", type: "communications", owner: "Comms Relay", priority: "critical", status: "queued", approval_status: "approved", eta_minutes: 1, guardrail: "calm_authoritative_tone", confidence: 94 },
  { action_id: "ACT-ZONE-003", tenant_id: "TEN-BALA-MFG", title: "Open north exit and close smoke corridor", type: "zone_control", owner: "Security Bravo", priority: "high", status: "awaiting_approval", approval_status: "manager_required", eta_minutes: 4, guardrail: "avoid_crowd_compression", confidence: 89 },
  { action_id: "ACT-FALLBACK-005", tenant_id: "TEN-GOVSECURE", title: "Switch notification provider to sovereign fallback", type: "failover", owner: "Cloud Sentinel", priority: "critical", status: "running", approval_status: "auto_safe", eta_minutes: 2, guardrail: "data_residency_locked", confidence: 92 },
];

export const fallbackAutonomySummary: MasterAutonomySummary = {
  autonomy_score: 94,
  actions_ready: 6,
  running_executions: 2,
  awaiting_approval: 1,
  retry_center: { failed_actions: 1, retry_success_percent: 97, fallback_provider: "sovereign_notification_queue", queue_pressure: 31 },
  recovery_score: 94,
  stability_eta_minutes: 8,
  action_queue: fallbackActions,
  live_executions: [
    { execution_id: "EXE-0001", tenant_id: "TEN-GRAND-MERIDIAN", action_id: "ACT-DISPATCH-001", status: "running", progress: 68, last_step: "Responder route confirmed via east stairwell", latency_ms: 210, retry_count: 0 },
    { execution_id: "EXE-0002", tenant_id: "TEN-GOVSECURE", action_id: "ACT-FALLBACK-005", status: "running", progress: 74, last_step: "Fallback provider accepted priority queue", latency_ms: 188, retry_count: 1 },
  ],
  recovery: [
    { recovery_id: "REC-CLOSED-LOOP", tenant_id: "TEN-GRAND-MERIDIAN", title: "Closed-loop fire recovery", score: 94, outcome: "Floor 3 evacuation stable; smoke containment verified.", next_action: "Start HVAC clearance and room reopen waves.", eta_minutes: 42 },
    { recovery_id: "REC-CYBER-FALLBACK", tenant_id: "TEN-GOVSECURE", title: "Cyber outage fallback recovery", score: 91, outcome: "Traffic shifted to sovereign queue with no data residency breach.", next_action: "Keep primary connector isolated until checks pass.", eta_minutes: 27 },
  ],
  failover_events: [
    { event: "notification provider switched", tenant: "SmartCity Authority", impact: "delivery preserved", confidence: 92 },
    { event: "workflow queue rebalanced", tenant: "Grand Meridian Hotels", impact: "SLA breach avoided", confidence: 89 },
  ],
  guardrails: [
    { guardrail_id: "GR-LIFE", name: "Life safety override", state: "active", coverage: 100, description: "Blocks revenue-optimized decisions when human risk exceeds threshold." },
    { guardrail_id: "GR-RBAC", name: "Human governance approvals", state: "active", coverage: 96, description: "Routes critical actions to manager, executive, or dual approval." },
    { guardrail_id: "GR-TENANT", name: "Tenant isolation", state: "active", coverage: 99, description: "Data and command actions stay scoped to tenant and region." },
  ],
  approval_modes: ["Advisory", "Approval Required", "Semi Auto", "Full Auto", "Emergency Manual Override"],
  closed_loop_outcomes: ["Responder dispatch corrected live after east stairwell pressure changed.", "Panic reroute reduced corridor density before emergency threshold.", "Cyber fallback kept command cloud online during provider outage."],
  events: [],
};

export const fallbackCloudSummary: MasterCloudSummary = {
  tenants_active: 5,
  regions_online: 5,
  buildings_managed: 283,
  users_managed: 5651,
  ai_runs_today: 111480,
  notifications_today: 2248400,
  average_sla_percent: 99.96,
  average_command_capacity: 91,
  global_incidents: [
    { incident_id: "INC-AUTO-FIRE", tenant_id: "TEN-GRAND-MERIDIAN", title: "Fire + auto dispatch", severity: "critical", status: "executing", eta_to_stability_min: 11, actions_linked: 6 },
    { incident_id: "INC-PANIC-REROUTE", tenant_id: "TEN-BALA-MFG", title: "Panic + crowd reroute", severity: "high", status: "stabilizing", eta_to_stability_min: 8, actions_linked: 5 },
    { incident_id: "INC-CYBER-FALLBACK", tenant_id: "TEN-GOVSECURE", title: "Cyber outage + fallback", severity: "high", status: "failover_active", eta_to_stability_min: 17, actions_linked: 7 },
  ],
  tenants: [
    { tenant_id: "TEN-GRAND-MERIDIAN", name: "Grand Meridian Hotels", vertical: "Hospitality", region: "North America", plan: "Enterprise", status: "mission_ready", buildings: 48, seats: 820, users: 744, ai_runs: 18420, notifications: 312000, storage_tb: 18.4, sla_percent: 99.96, mrr: 148000, arr: 1776000, open_incidents: 2, command_capacity: 91, role_hierarchy: ["owner", "regional_admin", "building_commander"], last_audit: "2026-04-26T00:06:00+00:00" },
    { tenant_id: "TEN-BALA-HOSP", name: "MetroCare Hospitals", vertical: "Healthcare", region: "India", plan: "Government", status: "protected", buildings: 22, seats: 1100, users: 1042, ai_runs: 22640, notifications: 498000, storage_tb: 24.9, sla_percent: 99.98, mrr: 216000, arr: 2592000, open_incidents: 1, command_capacity: 94, role_hierarchy: ["owner", "clinical_admin", "medical_responder"], last_audit: "2026-04-26T00:08:00+00:00" },
    { tenant_id: "TEN-BALA-MFG", name: "Nova Mall Group", vertical: "Retail", region: "GCC", plan: "Growth", status: "watch", buildings: 31, seats: 540, users: 492, ai_runs: 12780, notifications: 208400, storage_tb: 11.2, sla_percent: 99.91, mrr: 93000, arr: 1116000, open_incidents: 4, command_capacity: 84, role_hierarchy: ["owner", "mall_admin", "security_lead"], last_audit: "2026-04-26T00:10:00+00:00" },
    { tenant_id: "TEN-BALA-UNI", name: "Skyline University", vertical: "Education", region: "Europe", plan: "Enterprise", status: "mission_ready", buildings: 64, seats: 1360, users: 1208, ai_runs: 19240, notifications: 388000, storage_tb: 20.1, sla_percent: 99.94, mrr: 126000, arr: 1512000, open_incidents: 0, command_capacity: 89, role_hierarchy: ["owner", "campus_admin", "security_manager"], last_audit: "2026-04-26T00:12:00+00:00" },
    { tenant_id: "TEN-GOVSECURE", name: "SmartCity Authority", vertical: "Public Sector", region: "APAC", plan: "Custom Strategic", status: "sovereign", buildings: 118, seats: 2400, users: 2165, ai_runs: 38400, notifications: 842000, storage_tb: 41.8, sla_percent: 99.99, mrr: 420000, arr: 5040000, open_incidents: 3, command_capacity: 96, role_hierarchy: ["sovereign_owner", "regional_commander", "agency_admin"], last_audit: "2026-04-26T00:14:00+00:00" },
  ],
  regions: [
    { region_id: "REG-NA", name: "North America", tenants: 42, active_incidents: 5, latency_ms: 48, sla_percent: 99.95, capacity: 88, command_nodes: 126 },
    { region_id: "REG-GCC", name: "GCC", tenants: 18, active_incidents: 3, latency_ms: 61, sla_percent: 99.93, capacity: 82, command_nodes: 74 },
    { region_id: "REG-IN", name: "India", tenants: 57, active_incidents: 4, latency_ms: 54, sla_percent: 99.96, capacity: 91, command_nodes: 188 },
    { region_id: "REG-EU", name: "Europe", tenants: 39, active_incidents: 2, latency_ms: 58, sla_percent: 99.94, capacity: 86, command_nodes: 132 },
    { region_id: "REG-APAC", name: "APAC", tenants: 44, active_incidents: 6, latency_ms: 67, sla_percent: 99.92, capacity: 84, command_nodes: 141 },
  ],
  usage: [],
  audit: [],
};

export const fallbackRevenue: MasterRevenueRow[] = fallbackCloudSummary.tenants.map((tenant) => ({
  revenue_id: `REV-${tenant.tenant_id}`,
  tenant_id: tenant.tenant_id,
  tenant_name: tenant.name,
  mrr: tenant.mrr,
  arr: tenant.arr,
  growth_percent: tenant.tenant_id === "TEN-GOVSECURE" ? 182 : 124,
  churn_risk: tenant.status === "watch" ? 12 : 3,
  expansion_pipeline: Math.round(tenant.arr * 0.34),
  renewal_days: 48,
}));

export const fallbackBoardSummary: MasterBoardSummary = {
  arr: 4800000,
  mrr: 400000,
  growth_percent: 182,
  nrr: 129,
  runway_months: 30,
  burn_monthly: 210000,
  valuation_base: 62000000,
  ipo_score: 64,
  churn_forecast: 3.4,
  expansion_pipeline: 2100000,
  forecast: [
    { forecast_id: "FC-BASE", scenario: "base", arr_12_month: 18400000, growth_percent: 182, churn_percent: 3.4, enterprise_wins: 18, confidence: 91 },
    { forecast_id: "FC-AGGRESSIVE", scenario: "aggressive", arr_12_month: 28600000, growth_percent: 268, churn_percent: 2.2, enterprise_wins: 31, confidence: 82 },
  ],
  summary: [{ title: "April board command pack", readiness_score: 91, strategic_ask: "Approve sovereign pilot and Series A prep window.", top_risk: "Enterprise onboarding capacity becomes bottleneck if GCC pilots close together.", recommended_action: "Hire deployment lead and keep autonomy guardrails in approval-required mode for public-sector pilots." }],
  strategic_risks: [
    { risk: "Deployment capacity", severity: "medium", mitigation: "Hire enterprise rollout pod before sovereign pilot closes." },
    { risk: "Cloud region concentration", severity: "medium", mitigation: "Add APAC active-active failover before government expansion." },
  ],
};

export const fallbackInvestors: MasterInvestor[] = [
  { investor_id: "INV-SEQUOIA-SCOUT", fund: "Sequoia scout", stage: "partner_intro", conviction: 84, check_size: 500000, next_action: "Send crisis autonomy demo cut", fit: "AI infrastructure" },
  { investor_id: "INV-ACCEL", fund: "Accel partner", stage: "first_meeting", conviction: 78, check_size: 2500000, next_action: "Share ARR forecast and cloud tenant metrics", fit: "enterprise SaaS" },
  { investor_id: "INV-UAE", fund: "Sovereign UAE fund", stage: "partner_meeting", conviction: 88, check_size: 12000000, next_action: "Discuss sovereign command cloud", fit: "national resilience" },
  { investor_id: "INV-GOVTECH", fund: "Strategic GovTech Fund", stage: "term_sheet_watch", conviction: 91, check_size: 6000000, next_action: "Draft strategic pilot terms", fit: "public safety" },
];

export function formatCurrency(value: number) {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  }
  if (value >= 1_000) {
    return `$${Math.round(value / 1_000)}K`;
  }
  return `$${value.toLocaleString()}`;
}

export function statusTone(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("critical") || normalized.includes("breach") || normalized.includes("rollback")) {
    return "border-rose-300/25 bg-rose-400/10 text-rose-100";
  }
  if (normalized.includes("watch") || normalized.includes("required") || normalized.includes("waiting")) {
    return "border-amber-300/25 bg-amber-400/10 text-amber-100";
  }
  return "border-emerald-300/25 bg-emerald-400/10 text-emerald-100";
}

