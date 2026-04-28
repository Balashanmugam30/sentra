export type RealtimeEventType =
  | "incident.created"
  | "incident.update"
  | "prediction.updated"
  | "route.updated"
  | "alert.triggered"
  | "alert.notification"
  | "system.heartbeat";

export interface RealtimeEnvelopeMetadata {
  source?: "realtime" | "simulation";
  simulation_phase?: string;
  simulation_label?: string;
  timeline_time?: number;
  scenario_id?: string;
  fault?: string | null;
}

export interface RealtimeEnvelope<TPayload = unknown> {
  type: RealtimeEventType;
  message_id: string;
  sent_at: string;
  tenant_id?: string;
  building_id?: string;
  payload: TPayload;
  metadata?: RealtimeEnvelopeMetadata;
}

export interface IncidentRealtimePayload {
  incident_id: string;
  status: string;
  severity: "low" | "medium" | "high" | "critical";
  summary: string;
  recommendation?: string;
}

export interface PredictionRealtimePayload {
  summary: string;
  recommendation: string;
  confidence?: number;
}

export interface RouteRealtimePayload {
  progress_percent: number;
  route_health: "clear" | "watch" | "constrained" | "rerouting";
  active_alerts: number;
}

export interface AlertRealtimePayload {
  alert_id: string;
  channel: string;
  state: "idle" | "queued" | "active";
  title?: string;
}
