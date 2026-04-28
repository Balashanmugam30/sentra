export type DefenseSeverity = "low" | "medium" | "high";
export type DefenseStatus = "open" | "contained" | "watch" | "queued" | "monitor";

export type SeverityRadar = {
  high: number;
  medium: number;
  low: number;
};

export type DefenseIncident = {
  incident_id: string;
  tenant_id: string;
  org: string;
  title: string;
  category: string;
  severity: DefenseSeverity;
  status: DefenseStatus;
  detections: number;
  containment_action: string;
  mttd_seconds: number;
  mttr_minutes: number;
  analyst_owner: string;
  risk_score: number;
  created_at: string;
};

export type DefenseThreat = {
  threat_id: string;
  tenant_id: string;
  detector: string;
  category: string;
  signal: string;
  count: number;
  confidence: number;
  risk: number;
  status: DefenseStatus;
  recommended_action: string;
};

export type SocSummary = {
  open_incidents: number;
  detections_today: number;
  severity_radar: SeverityRadar;
  attack_categories: Record<string, number>;
  mean_response_time: number;
  auto_containment_count: number;
  threat_level: string;
  analyst_queue: number;
  zero_trust_average: number;
  policy_coverage: number;
  top_threats: DefenseThreat[];
};

export type ThreatCenter = {
  threats: DefenseThreat[];
  detectors: string[];
  categories: Record<string, number>;
  risk_average: number;
  highest_risk: number;
  automated_responses: string[];
};

export type ZeroTrustIdentity = {
  identity_id: string;
  tenant_id: string;
  actor: string;
  role: string;
  trust_score: number;
  band: "trusted" | "watch" | "risky" | "block";
  decision: string;
  device_trust: number;
  network_trust: number;
  session_trust: number;
  user_trust: number;
  triggers: string[];
  recommended_action: string;
};

export type ZeroTrustPolicy = {
  policy_id: string;
  name: string;
  control: string;
  blocks: number;
  step_up_count: number;
  status: string;
  coverage: number;
};

export type ZeroTrustState = {
  trust_score: number;
  band: string;
  device_trust: number;
  network_trust: number;
  session_trust: number;
  user_trust: number;
  step_up_triggers: number;
  policy_blocks: number;
  identities: ZeroTrustIdentity[];
  policies: ZeroTrustPolicy[];
  risk_heatmap: { zone: string; risk: number; trust: number }[];
};

export type ForensicEntry = {
  ledger_id: string;
  tenant_id: string;
  timestamp: string;
  actor: string;
  org: string;
  action: string;
  target: string;
  ip_region: string;
  device: string;
  result: string;
  severity: DefenseSeverity;
  chain_hash: string;
};

export type ForensicsState = {
  ledger: ForensicEntry[];
  timeline_events: number;
  privileged_actions: number;
  export_json_ready: boolean;
  export_csv_ready: boolean;
  chain_integrity: number;
  latest_hash: string;
  filters: string[];
};

export type ComplianceScore = {
  score: number;
  drivers: { label: string; value: number }[];
};

export type ExecutiveDefense = {
  security_maturity: number;
  risk_exposure: number;
  top_threats: DefenseThreat[];
  compliance_score: ComplianceScore;
  sla_response_score: number;
  readiness_index: number;
  zero_trust_score: number;
  audit_integrity: number;
  recommended_actions: string[];
  board_summary: string;
};

export type DefenseMutationResponse = {
  ok: boolean;
  message: string;
  data: Record<string, unknown>;
};

export type SecurityDefenseState = {
  summary: SocSummary;
  incidents: DefenseIncident[];
  threats: ThreatCenter;
  zeroTrust: ZeroTrustState;
  forensics: ForensicsState;
  executive: ExecutiveDefense;
  loading: boolean;
  error: string | null;
  busyAction: string | null;
  lastAction: string | null;
};
