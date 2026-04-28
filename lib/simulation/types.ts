export type SimulationGlobalMode =
  | "normal"
  | "caution"
  | "evacuation"
  | "lockdown"
  | "critical";

export type SimulationSystemHealth = "healthy" | "stressed" | "critical";
export type ZoneStatus = "stable" | "restricted" | "evacuating";
export type CorridorStatus = "clear" | "moderate" | "busy";
export type ResponderStatus = "enroute" | "staged" | "active";
export type ResponderTeam = "fire" | "medical" | "security" | "drone";

export type ZoneTwinState = {
  zone: string;
  risk_score: number;
  occupancy: number;
  status: ZoneStatus;
  safe_score: number;
  fire_threat: boolean;
};

export type CorridorTwinState = {
  from_zone: string;
  to_zone: string;
  traffic_load: number;
  status: CorridorStatus;
};

export type ResponderTwinState = {
  team: ResponderTeam;
  target_zone: string;
  eta_minutes: number;
  status: ResponderStatus;
};

export type SimulationResponse = {
  generated_at: string;
  global_mode: SimulationGlobalMode;
  system_health: SimulationSystemHealth;
  zones: ZoneTwinState[];
  corridors: CorridorTwinState[];
  responders: ResponderTwinState[];
  summary: string[];
};

export type TimelineZoneState = {
  zone: string;
  risk_score: number;
  occupancy: number;
  status: ZoneStatus;
};

export type TimelineSnapshot = {
  minute: 0 | 5 | 10 | 15;
  global_mode: SimulationGlobalMode;
  zones: TimelineZoneState[];
  corridor_loads: number;
  active_responders: number;
};

export type TimelineResponse = {
  generated_at: string;
  snapshots: TimelineSnapshot[];
  forecast_summary: string[];
};

export type ScenarioRequest = {
  incident_zone: string;
  severity: number;
  event_type: string;
};

export type ScenarioImpactItem = {
  minute: 5 | 10 | 15;
  event: string;
};

export type ScenarioResourceLoad = "low" | "medium" | "high" | "critical";

export type ScenarioResponse = {
  generated_at: string;
  scenario: string;
  recommended_mode: SimulationGlobalMode;
  severity_index: number;
  impact_chain: ScenarioImpactItem[];
  affected_zones: string[];
  recommended_actions: string[];
  resource_load: ScenarioResourceLoad;
};

export type WarRoomGlobalState = "normal" | "elevated" | "critical";

export type WarRoomAgentItem = {
  name: string;
  priority: string;
  confidence: number;
};

export type WarRoomResponse = {
  generated_at: string;
  global_state: WarRoomGlobalState;
  agents: WarRoomAgentItem[];
  conflicts: string[];
  consensus_plan: string[];
  commander_decision: string;
  response_score: number;
};
