export type PublicSafetyTrafficSegment = {
  segment_id: string;
  from_zone: string;
  to_zone: string;
  speed_kph: number;
  congestion_score: number;
  blocked: boolean;
  incident_related: boolean;
  eta_penalty_minutes: number;
  polyline: number[][];
};

export type PublicSafetyTransitLine = {
  line_id: string;
  mode: "bus" | "metro" | "shuttle";
  name: string;
  status: "running" | "delayed" | "paused";
  delay_minutes: number;
  crowding_level: number;
  affected_zones: string[];
};

export type PublicSafetyDispatchRoute = {
  route_id: string;
  vehicle_type: "ambulance" | "fire" | "police";
  from_zone: string;
  to_zone: string;
  status: "ready" | "reserved" | "constrained";
  eta_minutes: number;
  green_signal_ready: boolean;
  recommended_use: string;
  polyline: number[][];
};

export type PublicSafetyUtilities = {
  power_status: "normal" | "watch" | "degraded" | "outage";
  water_status: "normal" | "watch" | "degraded" | "outage";
  network_status: "normal" | "watch" | "degraded" | "outage";
  street_light_status: "normal" | "watch" | "degraded" | "outage";
  generator_status: "ready" | "active" | "strained" | "offline";
  recommendation: string;
};

export type PublicSafetyMobility = {
  zone_inflow: number;
  zone_outflow: number;
  pedestrian_pressure: number;
  queue_density: number;
  evac_flow_score: number;
  top_pressure_zone: string;
};

export type PublicSafetyLiveResponse = {
  summary_only: boolean;
  partial?: boolean;
  stale_data?: boolean;
  updated_at: string;
  traffic_provider: string;
  transit_provider: string;
  utility_provider: string;
  city_mode: string;
  traffic: PublicSafetyTrafficSegment[];
  transit: PublicSafetyTransitLine[];
  dispatch: PublicSafetyDispatchRoute[];
  utilities: PublicSafetyUtilities;
  mobility: PublicSafetyMobility;
  global_pressure: number;
  public_alerts: string[];
};

export type PublicSafetyTrafficResponse = {
  summary_only: boolean;
  updated_at: string;
  provider: string;
  segments: PublicSafetyTrafficSegment[];
};

export type PublicSafetyTransitResponse = {
  summary_only: boolean;
  updated_at: string;
  provider: string;
  lines: PublicSafetyTransitLine[];
};

export type PublicSafetyUtilityResponse = {
  summary_only: boolean;
  updated_at: string;
  provider: string;
  utilities: PublicSafetyUtilities;
};

export type PublicSafetyRoutePriorityResponse = {
  vehicle_type: string;
  from_zone: string;
  to_zone: string;
  priority_route: string[];
  eta_minutes: number;
  closures: string[];
  recommended_actions: string[];
  green_signal_ready: boolean;
};

export type PublicSafetyScenario =
  | "traffic_jam_gate"
  | "metro_shutdown"
  | "ambulance_priority"
  | "city_power_outage"
  | "crowd_surge_gate"
  | "multi_corridor_block"
  | "normal_day";

export type PublicSafetyTestScenarioResponse = {
  status: string;
  scenario: PublicSafetyScenario;
  live: PublicSafetyLiveResponse;
};
