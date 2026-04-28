export type PerceptionThreatLevel = "normal" | "elevated" | "critical";
export type DetectionIncidentType =
  | "fire_risk"
  | "gas_leak"
  | "panic_risk"
  | "anomaly_watch";

export type SensorZoneState = {
  zone: string;
  temperature: number;
  smoke_index: number;
  gas_ppm: number;
  crowd_density: number;
  noise_level: number;
};

export type PerceptionLiveResponse = {
  generated_at: string;
  zones: SensorZoneState[];
};

export type DetectionItem = {
  zone: string;
  incident_type: DetectionIncidentType;
  confidence: number;
  reasons: string[];
};

export type PerceptionDetectionResponse = {
  generated_at: string;
  threat_level: PerceptionThreatLevel;
  detections: DetectionItem[];
  recommended_actions: string[];
};

export type InjectedIncidentItem = {
  zone: string;
  incident_type: string;
  severity: number;
  reason: string;
};

export type SkippedIncidentItem = {
  zone: string;
  reason: string;
};

export type ScanAndInjectResponse = {
  generated_at: string;
  threat_level: PerceptionThreatLevel;
  detections_found: number;
  incidents_created: number;
  incidents_skipped: number;
  created: InjectedIncidentItem[];
  skipped: SkippedIncidentItem[];
};

export type FusionZoneState = "stable" | "watch" | "elevated" | "critical";

export type FusionZoneItem = {
  zone: string;
  sensor_score: number;
  incident_score: number;
  prediction_score: number;
  memory_score: number;
  fused_score: number;
  confidence: number;
  state: FusionZoneState;
  drivers: string[];
};

export type FusionResponse = {
  generated_at: string;
  global_status: FusionZoneState;
  zones: FusionZoneItem[];
  recommended_focus: string[];
};

export type OverrideType =
  | "safe_zone_override"
  | "route_override"
  | "resource_override"
  | "alert_override"
  | "commander_override";

export type OverrideGlobalMode =
  | "aligned"
  | "adaptive-control"
  | "emergency-correction";

export type OverrideDecisionItem = {
  type: OverrideType;
  zone: string;
  old_value: string;
  new_value: string;
  reason: string;
};

export type OverrideResponse = {
  generated_at: string;
  global_mode: OverrideGlobalMode;
  override_count: number;
  zones_reviewed: number;
  overrides: OverrideDecisionItem[];
  approved_decisions: string[];
  recommended_focus: string[];
};
