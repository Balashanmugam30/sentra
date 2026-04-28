export type TwinFacility = {
  facility_id: string;
  tenant_id: string;
  name: string;
  type: string;
  floors: number;
  rooms: number;
  zones: number;
  twin_health: number;
  live_occupancy: number;
  risk_score: number;
  readiness: number;
  location: string;
  active_incident: string;
};

export type TwinFloor = {
  floor_id: string;
  facility_id: string;
  tenant_id: string;
  label: string;
  level: number;
  occupancy: number;
  capacity: number;
  risk: number;
  readiness: number;
  smoke: number;
  heat: number;
  gas: number;
  flow_rate: number;
  evacuation_progress: number;
  status: string;
  active_zone: string;
};

export type TwinZone = {
  zone_id: string;
  floor_id: string;
  tenant_id: string;
  name: string;
  status: string;
  occupancy: number;
  density: number;
  risk: number;
  x: number;
  y: number;
  width: number;
  height: number;
  flow: string;
};

export type TwinSensor = {
  sensor_id: string;
  tenant_id: string;
  facility_id: string;
  floor_id: string;
  zone_id: string;
  type: string;
  value: number;
  unit: string;
  state: string;
  latency_ms: number;
  battery: number;
};

export type TwinHazard = {
  hazard_id: string;
  tenant_id: string;
  facility_id: string;
  floor_id: string;
  type: string;
  severity: number;
  spread_rate: number;
  affected_zones: string[];
  projection_10m: string;
  color: string;
};

export type TwinResponder = {
  responder_id: string;
  tenant_id: string;
  name: string;
  role: string;
  facility_id: string;
  floor_id: string;
  x: number;
  y: number;
  status: string;
  eta_minutes: number;
  mission: string;
};

export type TwinRoute = {
  route_id: string;
  tenant_id: string;
  facility_id: string;
  floor_id: string;
  name: string;
  status: string;
  confidence: number;
  eta_minutes: number;
  distance_m: number;
  steps: string[];
  path: [number, number][];
};

export type TwinReplay = {
  replay_id: string;
  tenant_id: string;
  title: string;
  facility_id: string;
  duration_seconds: number;
  outcome: string;
  score: number;
  casualties_avoided: number;
  loss_reduced: number;
};

export type TwinReplayEvent = {
  event_id: string;
  replay_id: string;
  tenant_id: string;
  second: number;
  type: string;
  title: string;
  detail: string;
};

export type TwinScenario = {
  scenario_id: string;
  name: string;
  facility_id: string;
  difficulty: string;
  estimated_duration_min: number;
  objective: string;
};

export type TwinSummary = {
  facilities_modeled: number;
  floors_live: number;
  active_sensors: number;
  hazard_layers: number;
  responders_tracked: number;
  occupancy_live: number;
  average_twin_health: number;
  average_readiness: number;
  highest_risk_score: number;
  facilities: TwinFacility[];
};

export type TwinLive = TwinSummary & {
  floors: TwinFloor[];
  zones: TwinZone[];
  sensors: TwinSensor[];
  hazards: TwinHazard[];
  responders: TwinResponder[];
  routes: TwinRoute[];
  ai_layers: { layer: string; score: number; confidence: number; source: string }[];
  timeline: TwinReplayEvent[];
};

export type TwinFacilityState = {
  facility: TwinFacility;
  floors: TwinFloor[];
  utilities: { name: string; status: string; health: number; detail: string }[];
};

export type TwinReplayState = {
  replays: TwinReplay[];
  selected: TwinReplay;
  events: TwinReplayEvent[];
  scrubber: { position_seconds: number; duration_seconds: number; speed: number; state: string };
  comparison: { actual_outcome: string; alternate_outcome: string; winner: string; confidence: number };
};

export type TwinTelemetry = {
  sensors: TwinSensor[];
  packets_per_minute: number;
  average_latency_ms: number;
  camera_zones_online: number;
  telemetry_health: number;
};

export type TwinMutationResponse = {
  ok: boolean;
  message: string;
  data: Record<string, unknown>;
};

export type TwinPrediction = {
  prediction_id: string;
  tenant_id: string;
  facility: string;
  domain: string;
  risk: number;
  horizon_5: string;
  horizon_15: string;
  horizon_30: string;
  confidence: number;
  recommended_action: string;
};

export type TwinRiskMapPoint = {
  risk_id: string;
  tenant_id: string;
  facility: string;
  zone: string;
  x: number;
  y: number;
  risk: number;
  type: string;
  exposure: number;
  reputation: number;
};

export type TwinPredictiveState = {
  prediction_score: number;
  highest_risk: number;
  confidence: number;
  financial_exposure: number;
  reputation_risk: number;
  predictions: TwinPrediction[];
  risk_map: TwinRiskMapPoint[];
  next_best_action: string;
};

export type TwinForecast = {
  horizons: { window: string; fire_spread: number; gas_spread: number; crowd_pressure: number; panic: number; utility_chain: number }[];
  dominant_risks: string[];
  eta_drift_minutes: number;
  blocked_exit_probability: number;
  downtime_exposure: number;
  confidence: number;
};

export type TwinOptimizedRoute = {
  route_id: string;
  tenant_id: string;
  name: string;
  use_case: string;
  owner: string;
  from: string;
  to: string;
  eta_minutes: number;
  safety: number;
  congestion: number;
  hazard_avoidance: number;
  reserve_capacity: number;
  score: number;
  steps: string[];
};

export type TwinLiveRoutes = {
  routes: TwinOptimizedRoute[];
  route_brain_score: number;
  active_optimizations: number;
  average_score: number;
};

export type TwinResource = {
  resource_id: string;
  tenant_id: string;
  name: string;
  type: string;
  deployed: number;
  idle: number;
  overload: number;
  reserve_health: number;
  best_move: string;
};

export type TwinResourcesState = {
  resources: TwinResource[];
  reserve_health: number;
  overload_zones: TwinResource[];
  idle_assets: number;
  best_reallocation_moves: string[];
};

export type TwinCampusBuilding = {
  building_id: string;
  tenant_id: string;
  campus: string;
  name: string;
  health: number;
  occupancy: number;
  pressure: number;
  incident: string;
  shared_resource: string;
};

export type TwinNetworkLink = {
  link_id: string;
  tenant_id: string;
  from: string;
  to: string;
  route_health: number;
  travel_minutes: number;
  cascading_risk: number;
};

export type TwinCampusState = {
  buildings: TwinCampusBuilding[];
  campuses: string[];
  average_health: number;
  occupancy_pressure: number;
  shared_resources: string[];
  cascading_risk: number;
  links?: TwinNetworkLink[];
};

export type TwinStrategy = {
  strategy_id: string;
  tenant_id: string;
  name: string;
  casualty_risk: number;
  recovery_eta: number;
  downtime_hours: number;
  financial_loss: number;
  reputation_risk: number;
  confidence: number;
  winner: boolean;
  why: string;
};

export type TwinCompareState = {
  strategies: TwinStrategy[];
  winner: TwinStrategy;
  board_summary: string;
};

export type TwinReplayLesson = {
  lesson_id: string;
  tenant_id: string;
  replay_id: string;
  mistake: string;
  better_alternative: string;
  audit_evidence: string;
  impact: string;
  confidence: number;
};

export type TwinReplayIntelligence = {
  lessons: TwinReplayLesson[];
  what_should_have_happened: string[];
  audit_evidence: string[];
  average_confidence: number;
  replay: TwinReplayState;
};
