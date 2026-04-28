export type PredictionTrend = "low" | "rising" | "critical";

export type PredictionItem = {
  zone: string;
  risk_score: number;
  trend: PredictionTrend;
  eta_seconds: number;
  confidence: number;
};

export type PredictionResponse = {
  generated_at: string;
  predictions: PredictionItem[];
};

export type FireSpreadStatus = "watch" | "danger" | "critical";

export type FireSpreadForecastItem = {
  source_zone: string;
  target_zone: string;
  probability: number;
  eta_minutes: number;
  heat_index: number;
  status: FireSpreadStatus;
};

export type FireSpreadResponse = {
  generated_at: string;
  active_sources: number;
  forecasts: FireSpreadForecastItem[];
};

export type EvacuationGlobalStatus = "stable" | "caution" | "critical";
export type EvacuationPriority = "low" | "medium" | "high";

export type SafeZoneRecommendation = {
  zone: string;
  capacity_score: number;
  safety_score: number;
};

export type BlockedZoneItem = {
  zone: string;
  reason: string;
};

export type EvacuationRouteItem = {
  from_zone: string;
  to_zone: string;
  eta_minutes: number;
  priority: EvacuationPriority;
};

export type EvacuationResponse = {
  generated_at: string;
  global_status: EvacuationGlobalStatus;
  recommended_safe_zones: SafeZoneRecommendation[];
  blocked_zones: BlockedZoneItem[];
  routes: EvacuationRouteItem[];
  alerts: string[];
};

export type ResourceGlobalLoad = "normal" | "elevated" | "overloaded";
export type ResourcePriority = "low" | "medium" | "high" | "critical";

export type AvailableUnits = {
  fire_teams: number;
  medical_teams: number;
  security_teams: number;
  drones: number;
};

export type ResourceDeploymentItem = {
  zone: string;
  priority: ResourcePriority;
  fire_teams: number;
  medical_teams: number;
  security_teams: number;
  drone_support: boolean;
  eta_minutes: number;
  containment_eta_minutes: number;
};

export type ResourceDeploymentResponse = {
  generated_at: string;
  global_load: ResourceGlobalLoad;
  available_units: AvailableUnits;
  deployments: ResourceDeploymentItem[];
  shortages: string[];
  recommendations: string[];
};

export type CommunicationThreatLevel = "normal" | "elevated" | "critical";
export type CommunicationPriority = "normal" | "elevated" | "critical";
export type ResponderTeam = "fire" | "medical" | "security";

export type OccupantAlertItem = {
  zone: string;
  priority: CommunicationPriority;
  message: string;
};

export type ResponderMessageItem = {
  team: ResponderTeam;
  zone: string;
  message: string;
};

export type CommunicationResponse = {
  generated_at: string;
  threat_level: CommunicationThreatLevel;
  occupant_alerts: OccupantAlertItem[];
  responder_messages: ResponderMessageItem[];
  executive_summary: string[];
  escalations: string[];
};

export type IncidentMode =
  | "monitor"
  | "response"
  | "evacuation"
  | "lockdown"
  | "mass-casualty";

export type CommanderActionItem = {
  priority: number;
  title: string;
};

export type CommanderResponse = {
  generated_at: string;
  incident_mode: IncidentMode;
  severity_index: number;
  top_actions: CommanderActionItem[];
  resource_orders: string[];
  strategic_objectives: string[];
  next_15_min_plan: string[];
  executive_status: string;
};

export type CoordinatorGlobalMode =
  | "stabilize"
  | "evacuation"
  | "lockdown"
  | "containment";

export type CoordinatorSystemHealth = "normal" | "elevated" | "critical";
export type CoordinatorSource =
  | "live"
  | "fire-spread"
  | "evacuation"
  | "resources"
  | "communications"
  | "commander"
  | "memory";

export type CoordinatorConflictItem = {
  source: CoordinatorSource;
  issue: string;
};

export type CoordinatedActionItem = {
  agent: CoordinatorSource;
  action: string;
};

export type CoordinatorResponse = {
  generated_at: string;
  global_mode: CoordinatorGlobalMode;
  system_health: CoordinatorSystemHealth;
  conflicts_detected: CoordinatorConflictItem[];
  priority_stack: string[];
  coordinated_actions: CoordinatedActionItem[];
  cross_agent_score: number;
  recommended_next_phase: string;
};

export type HotspotZoneItem = {
  zone: string;
  score: number;
};

export type TrustedSafeZoneItem = {
  zone: string;
  reliability: number;
};

export type HistoricalRouteItem = {
  from_zone: string;
  to_zone: string;
  success_rate: number;
};

export type ResourceEffectivenessItem = {
  zone: string;
  best_unit: string;
  impact_score: number;
};

export type MemoryResponse = {
  generated_at: string;
  total_incidents_observed: number;
  hotspot_zones: HotspotZoneItem[];
  trusted_safe_zones: TrustedSafeZoneItem[];
  historical_route_success: HistoricalRouteItem[];
  resource_effectiveness: ResourceEffectivenessItem[];
  learning_status: "active";
};

export type LearningDecisionResponse = {
  generated_at: string;
  adaptive_actions: string[];
  confidence: number;
  based_on_events: number;
};
