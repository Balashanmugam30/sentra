// Incident types are feature-owned and should remain within the incident
// module unless another bounded context genuinely shares them.
export type IncidentSeverity = "low" | "medium" | "high" | "critical";
export type SystemStatus = "monitoring" | "alert" | "emergency";
export type RouteHealth = "clear" | "watch" | "constrained" | "rerouting";
export type AlertState = "idle" | "queued" | "active";

export interface AIInsight {
  summary: string;
  recommendation: string;
  confidence?: number;
  explanation?: string;
  nextImpactLabel?: string;
  nextImpactTimeSec?: number;
  updatedAt?: string;
}

export interface ActiveAlert {
  id: string;
  channel: string;
  state: AlertState;
}

export interface EvacuationState {
  progressPercent: number;
  routeHealth: RouteHealth;
  activeAlerts: number;
  lastAlertChannel?: string;
  lastUpdatedAt?: string;
}

export interface Incident {
  incident_id: string;
  status: string;
  severity: IncidentSeverity;
  summary: string;
  created_at: string;
  updated_at: string;
}

export interface IncidentSummary {
  incidentId: string;
  status: string;
  severity: IncidentSeverity;
  summary: string;
  updatedAt: string;
  aiInsight: AIInsight;
  evacuation: EvacuationState;
  alerts: ActiveAlert[];
}
