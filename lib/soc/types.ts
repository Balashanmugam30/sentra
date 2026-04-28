export type SocThreatLevel = "low" | "medium" | "high" | "critical";
export type SocModuleStatus = "healthy" | "watch" | "degraded" | "critical" | "offline";
export type SocIncidentStatus = "open" | "investigating" | "contained" | "resolved";

export type SocLiveResponse = {
  generated_at: string;
  threat_level: SocThreatLevel;
  open_incidents: number;
  detections_today: number;
  blocked_actions: number;
  health_score: number;
  requests_per_minute: number;
  top_alerts: string[];
  summary_only: boolean;
};

export type SocHealthModule = {
  module: string;
  request_count: number;
  error_count: number;
  avg_latency_ms: number;
  p95_latency_ms: number;
  last_seen: string | null;
  uptime_status: string;
  module_state: string;
  status: SocModuleStatus;
};

export type SocHealthResponse = {
  generated_at: string;
  health_score: number;
  modules: SocHealthModule[];
};

export type SocDetection = {
  detection_id: string;
  title: string;
  severity: string;
  source_rule: string;
  description: string;
  related_event_ids: string[];
  affected_user: string | null;
  affected_module: string | null;
};

export type SocDetectionsResponse = {
  generated_at: string;
  detections: SocDetection[];
};

export type SocIncident = {
  incident_id: string;
  created_at: string;
  last_seen: string;
  title: string;
  severity: string;
  source_rule: string;
  affected_user: string | null;
  affected_module: string | null;
  recommended_actions: string[];
  status: SocIncidentStatus;
  resolved_at?: string | null;
};

export type SocIncidentsResponse = {
  generated_at: string;
  incidents: SocIncident[];
};

export type SocRunScanResponse = {
  scanned: boolean;
  detection_count: number;
  incident_count: number;
  health_score: number;
};

export type SocResolveIncidentResponse = {
  resolved: boolean;
  incident: SocIncident;
};

export type SocTestAttackScenario =
  | "brute_force"
  | "privilege_abuse"
  | "latency_spike"
  | "facility_command_storm"
  | "token_abuse";

export type SocTestAttackResponse = {
  status: string;
  scenario: SocTestAttackScenario;
  threat_level: SocThreatLevel;
  detections: SocDetection[];
  incidents: SocIncident[];
};
