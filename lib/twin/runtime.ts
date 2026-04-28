import type {
  TwinCampusState,
  TwinCompareState,
  TwinFacilityState,
  TwinForecast,
  TwinLive,
  TwinLiveRoutes,
  TwinPredictiveState,
  TwinReplayIntelligence,
  TwinReplayState,
  TwinResourcesState,
  TwinScenario,
  TwinTelemetry,
} from "@/lib/twin/types";

export const fallbackLive: TwinLive = {
  facilities_modeled: 5,
  floors_live: 6,
  active_sensors: 5,
  hazard_layers: 4,
  responders_tracked: 4,
  occupancy_live: 5572,
  average_twin_health: 95.8,
  average_readiness: 90.4,
  highest_risk_score: 82,
  facilities: [
    { facility_id: "FAC-GRAND-MERIDIAN", tenant_id: "TEN-GRAND-MERIDIAN", name: "Grand Meridian Hotel", type: "hotel", floors: 12, rooms: 612, zones: 84, twin_health: 97, live_occupancy: 428, risk_score: 82, readiness: 91, location: "New York", active_incident: "Hotel kitchen fire" },
    { facility_id: "FAC-METROCARE", tenant_id: "TEN-BALA-HOSP", name: "MetroCare Hospital", type: "hospital", floors: 9, rooms: 420, zones: 68, twin_health: 96, live_occupancy: 920, risk_score: 64, readiness: 94, location: "Coimbatore", active_incident: "Hospital oxygen leak" },
    { facility_id: "FAC-NOVA-MALL", tenant_id: "TEN-BALA-MFG", name: "Nova Mall Center", type: "mall", floors: 5, rooms: 220, zones: 52, twin_health: 93, live_occupancy: 1840, risk_score: 77, readiness: 86, location: "Dubai", active_incident: "Mall panic surge" },
    { facility_id: "FAC-SKYLINE-TOWER", tenant_id: "TEN-BALA-UNI", name: "Skyline Campus Tower", type: "campus", floors: 18, rooms: 780, zones: 96, twin_health: 95, live_occupancy: 1260, risk_score: 58, readiness: 89, location: "London", active_incident: "Campus lab gas alert" },
    { facility_id: "FAC-SMARTCITY-HUB", tenant_id: "TEN-GOVSECURE", name: "SmartCity Metro Hub", type: "transport", floors: 4, rooms: 160, zones: 48, twin_health: 98, live_occupancy: 3120, risk_score: 71, readiness: 92, location: "Singapore", active_incident: "Cyber outage during evacuation" },
  ],
  floors: [
    { floor_id: "GM-F03", facility_id: "FAC-GRAND-MERIDIAN", tenant_id: "TEN-GRAND-MERIDIAN", label: "Floor 3 - Kitchen + Guest Wing", level: 3, occupancy: 428, capacity: 720, risk: 86, readiness: 78, smoke: 72, heat: 68, gas: 18, flow_rate: 118, evacuation_progress: 54, status: "critical", active_zone: "Kitchen Zone B" },
    { floor_id: "GM-F04", facility_id: "FAC-GRAND-MERIDIAN", tenant_id: "TEN-GRAND-MERIDIAN", label: "Floor 4 - Guest Rooms", level: 4, occupancy: 312, capacity: 680, risk: 64, readiness: 84, smoke: 36, heat: 31, gas: 8, flow_rate: 96, evacuation_progress: 42, status: "watch", active_zone: "East Corridor" },
    { floor_id: "NM-L02", facility_id: "FAC-NOVA-MALL", tenant_id: "TEN-BALA-MFG", label: "Level 2 - Food Court", level: 2, occupancy: 1840, capacity: 2400, risk: 77, readiness: 72, smoke: 18, heat: 24, gas: 6, flow_rate: 420, evacuation_progress: 37, status: "crowd_pressure", active_zone: "North Atrium" },
  ],
  zones: [
    { zone_id: "GM-KITCHEN-B", floor_id: "GM-F03", tenant_id: "TEN-GRAND-MERIDIAN", name: "Kitchen Zone B", status: "hazard", occupancy: 46, density: 68, risk: 92, x: 18, y: 46, width: 26, height: 22, flow: "east stairwell" },
    { zone_id: "GM-EAST-CORRIDOR", floor_id: "GM-F03", tenant_id: "TEN-GRAND-MERIDIAN", name: "East Corridor", status: "route", occupancy: 118, density: 54, risk: 58, x: 50, y: 42, width: 32, height: 16, flow: "stairwell B" },
    { zone_id: "GM-STAIR-B", floor_id: "GM-F03", tenant_id: "TEN-GRAND-MERIDIAN", name: "Stairwell B", status: "safe", occupancy: 82, density: 48, risk: 28, x: 84, y: 38, width: 12, height: 30, flow: "down" },
    { zone_id: "NM-FOOD-COURT", floor_id: "NM-L02", tenant_id: "TEN-BALA-MFG", name: "Food Court", status: "crowded", occupancy: 940, density: 87, risk: 80, x: 24, y: 28, width: 42, height: 34, flow: "north + east exits" },
  ],
  sensors: [
    { sensor_id: "IOT-GM-GAS-01", tenant_id: "TEN-GRAND-MERIDIAN", facility_id: "FAC-GRAND-MERIDIAN", floor_id: "GM-F03", zone_id: "GM-KITCHEN-B", type: "gas", value: 642, unit: "ppm", state: "warning", latency_ms: 38, battery: 94 },
    { sensor_id: "IOT-GM-FLAME-02", tenant_id: "TEN-GRAND-MERIDIAN", facility_id: "FAC-GRAND-MERIDIAN", floor_id: "GM-F03", zone_id: "GM-KITCHEN-B", type: "flame", value: 1, unit: "bool", state: "critical", latency_ms: 31, battery: 91 },
    { sensor_id: "CAM-GM-COR-01", tenant_id: "TEN-GRAND-MERIDIAN", facility_id: "FAC-GRAND-MERIDIAN", floor_id: "GM-F03", zone_id: "GM-EAST-CORRIDOR", type: "camera", value: 78, unit: "visibility", state: "online", latency_ms: 52, battery: 100 },
  ],
  hazards: [
    { hazard_id: "HZ-GM-SMOKE", tenant_id: "TEN-GRAND-MERIDIAN", facility_id: "FAC-GRAND-MERIDIAN", floor_id: "GM-F03", type: "smoke", severity: 86, spread_rate: 14, affected_zones: ["GM-KITCHEN-B", "GM-EAST-CORRIDOR"], projection_10m: "Smoke reaches service corridor unless HVAC damper holds.", color: "rose" },
    { hazard_id: "HZ-NM-CROWD", tenant_id: "TEN-BALA-MFG", facility_id: "FAC-NOVA-MALL", floor_id: "NM-L02", type: "crowd_pressure", severity: 81, spread_rate: 18, affected_zones: ["NM-FOOD-COURT"], projection_10m: "North atrium congestion crosses stampede threshold without split routing.", color: "violet" },
  ],
  responders: [
    { responder_id: "RESP-FIRE-A", tenant_id: "TEN-GRAND-MERIDIAN", name: "Fire Team Alpha", role: "fire", facility_id: "FAC-GRAND-MERIDIAN", floor_id: "GM-F03", x: 78, y: 60, status: "moving", eta_minutes: 2, mission: "Kitchen containment" },
    { responder_id: "RESP-MED-2", tenant_id: "TEN-GRAND-MERIDIAN", name: "Medic Unit 2", role: "medical", facility_id: "FAC-GRAND-MERIDIAN", floor_id: "GM-F03", x: 72, y: 28, status: "staged", eta_minutes: 4, mission: "Triage east corridor" },
  ],
  routes: [
    { route_id: "ROUTE-GM-EAST", tenant_id: "TEN-GRAND-MERIDIAN", facility_id: "FAC-GRAND-MERIDIAN", floor_id: "GM-F03", name: "East Stairwell B evacuation", status: "recommended", confidence: 94, eta_minutes: 5, distance_m: 118, steps: ["Exit Kitchen B via east service door", "Follow illuminated corridor markers", "Descend Stairwell B", "Assemble at South Gate"], path: [[18, 55], [44, 52], [74, 48], [90, 56]] },
  ],
  ai_layers: [
    { layer: "Crisis risk", score: 86, confidence: 94, source: "MLOps risk predictor" },
    { layer: "Panic spread", score: 72, confidence: 89, source: "Human behavior engine" },
    { layer: "Route pressure", score: 81, confidence: 91, source: "Crowd evacuation model" },
  ],
  timeline: [],
};

const fallbackPrimaryFacility = fallbackLive.facilities[0] ?? {
  facility_id: "FAC-GRAND-MERIDIAN",
  tenant_id: "TEN-GRAND-MERIDIAN",
  name: "Grand Meridian Hotel",
  type: "hotel",
  floors: 12,
  rooms: 612,
  zones: 84,
  twin_health: 97,
  live_occupancy: 428,
  risk_score: 82,
  readiness: 91,
  location: "New York",
  active_incident: "Hotel kitchen fire",
};

export const fallbackFacility: TwinFacilityState = {
  facility: fallbackPrimaryFacility,
  floors: fallbackLive.floors,
  utilities: [
    { name: "HVAC", status: "partitioned", health: 88, detail: "Kitchen damper closed; guest wing airflow protected." },
    { name: "Power", status: "stable", health: 96, detail: "Emergency lighting online across routed floors." },
    { name: "Network", status: "degraded_ready", health: 92, detail: "Edge cache and local command mode active." },
    { name: "Elevators", status: "locked_for_response", health: 91, detail: "Public elevator recall complete; responder override available." },
    { name: "Stairwells", status: "open", health: 94, detail: "Stairwell B recommended; west stairwell backup." },
    { name: "Safe Zones", status: "available", health: 89, detail: "South Gate and courtyard assembly areas below capacity." },
  ],
};

export const fallbackReplay: TwinReplayState = {
  replays: [
    { replay_id: "RPL-HOTEL-KITCHEN", tenant_id: "TEN-GRAND-MERIDIAN", title: "Hotel kitchen fire", facility_id: "FAC-GRAND-MERIDIAN", duration_seconds: 780, outcome: "Contained with partial evacuation", score: 94, casualties_avoided: 43, loss_reduced: 820000 },
    { replay_id: "RPL-MALL-PANIC", tenant_id: "TEN-BALA-MFG", title: "Mall panic surge", facility_id: "FAC-NOVA-MALL", duration_seconds: 960, outcome: "Crowd split prevented atrium crush", score: 91, casualties_avoided: 118, loss_reduced: 540000 },
  ],
  selected: { replay_id: "RPL-HOTEL-KITCHEN", tenant_id: "TEN-GRAND-MERIDIAN", title: "Hotel kitchen fire", facility_id: "FAC-GRAND-MERIDIAN", duration_seconds: 780, outcome: "Contained with partial evacuation", score: 94, casualties_avoided: 43, loss_reduced: 820000 },
  events: [
    { event_id: "RPL-EVT-001", replay_id: "RPL-HOTEL-KITCHEN", tenant_id: "TEN-GRAND-MERIDIAN", second: 0, type: "sensor", title: "Flame sensor triggered", detail: "Kitchen Zone B flame verification at 94 percent confidence." },
    { event_id: "RPL-EVT-002", replay_id: "RPL-HOTEL-KITCHEN", tenant_id: "TEN-GRAND-MERIDIAN", second: 90, type: "ai_decision", title: "Partial evacuation selected", detail: "AI council selected east stairwell phased route over full evacuation." },
    { event_id: "RPL-EVT-003", replay_id: "RPL-HOTEL-KITCHEN", tenant_id: "TEN-GRAND-MERIDIAN", second: 210, type: "message", title: "Guided voice broadcast sent", detail: "Calm authoritative tone reduced hesitation by 18 percent." },
  ],
  scrubber: { position_seconds: 210, duration_seconds: 780, speed: 1, state: "paused" },
  comparison: { actual_outcome: "Contained with partial evacuation", alternate_outcome: "Full evacuation would have increased congestion by 23 percent.", winner: "guided phased evacuation", confidence: 91 },
};

export const fallbackTelemetry: TwinTelemetry = {
  sensors: fallbackLive.sensors,
  packets_per_minute: 1240,
  average_latency_ms: 40.3,
  camera_zones_online: 1,
  telemetry_health: 96,
};

export const fallbackScenarios: TwinScenario[] = [
  { scenario_id: "SCN-FIRE-ROOM-X", name: "Fire in Room X", facility_id: "FAC-GRAND-MERIDIAN", difficulty: "critical", estimated_duration_min: 14, objective: "Contain smoke and evacuate adjacent zones." },
  { scenario_id: "SCN-GAS-ZONE-Y", name: "Gas Leak in Zone Y", facility_id: "FAC-SKYLINE-TOWER", difficulty: "high", estimated_duration_min: 18, objective: "Isolate lab, shut HVAC, route students away." },
  { scenario_id: "SCN-CYBER-FIRE", name: "Cyber + Fire Combo", facility_id: "FAC-SMARTCITY-HUB", difficulty: "extreme", estimated_duration_min: 28, objective: "Use degraded local command and protected evacuation." },
];

export const fallbackPredictive: TwinPredictiveState = {
  prediction_score: 93,
  highest_risk: 88,
  confidence: 91,
  financial_exposure: 5060000,
  reputation_risk: 71.8,
  next_best_action: "Compute route split, rebalance idle responders, and hold executive strategy in corridor-first mode.",
  predictions: [
    { prediction_id: "PRED-FIRE-GM-001", tenant_id: "TEN-GRAND-MERIDIAN", facility: "Grand Meridian Hotel", domain: "fire_spread", risk: 88, horizon_5: "Smoke reaches service corridor edge.", horizon_15: "Kitchen heat remains contained if suppression holds.", horizon_30: "Guest wing re-entry possible after HVAC clearance.", confidence: 94, recommended_action: "Contain corridor-first and keep Stairwell B open." },
    { prediction_id: "PRED-CROWD-NM-001", tenant_id: "TEN-BALA-MFG", facility: "Nova Mall Group", domain: "crowd_congestion", risk: 84, horizon_5: "Food court density exceeds comfort threshold.", horizon_15: "North atrium bottleneck forms without split routing.", horizon_30: "Crowd stabilizes if east exit is made primary.", confidence: 91, recommended_action: "Split flow between north and east exits now." },
    { prediction_id: "PRED-CYBER-SC-001", tenant_id: "TEN-GOVSECURE", facility: "SmartCity District", domain: "utility_failure_chain", risk: 79, horizon_5: "Primary notification queue degrades.", horizon_15: "Fallback provider preserves command traffic.", horizon_30: "Manual wayfinding remains available if edge cache holds.", confidence: 92, recommended_action: "Switch to sovereign notification fallback and reduce noncritical polling." },
  ],
  risk_map: [
    { risk_id: "RM-GM-KITCHEN", tenant_id: "TEN-GRAND-MERIDIAN", facility: "Grand Meridian Hotel", zone: "Kitchen Zone B", x: 18, y: 46, risk: 92, type: "fire", exposure: 820000, reputation: 74 },
    { risk_id: "RM-NM-FOOD", tenant_id: "TEN-BALA-MFG", facility: "Nova Mall Group", zone: "Food Court", x: 34, y: 38, risk: 84, type: "crowd", exposure: 540000, reputation: 81 },
    { risk_id: "RM-MC-ICU", tenant_id: "TEN-BALA-HOSP", facility: "MetroCare Campus", zone: "ICU Oxygen Manifold", x: 61, y: 35, risk: 69, type: "clinical", exposure: 1200000, reputation: 88 },
  ],
};

export const fallbackForecast: TwinForecast = {
  horizons: [
    { window: "5 min", fire_spread: 68, gas_spread: 42, crowd_pressure: 74, panic: 51, utility_chain: 39 },
    { window: "15 min", fire_spread: 59, gas_spread: 48, crowd_pressure: 81, panic: 62, utility_chain: 55 },
    { window: "30 min", fire_spread: 35, gas_spread: 31, crowd_pressure: 44, panic: 38, utility_chain: 43 },
  ],
  dominant_risks: ["fire_spread", "crowd_congestion", "utility_failure_chain"],
  eta_drift_minutes: 3,
  blocked_exit_probability: 27,
  downtime_exposure: 2860000,
  confidence: 91,
};

export const fallbackLiveRoutes: TwinLiveRoutes = {
  route_brain_score: 94,
  active_optimizations: 4,
  average_score: 92,
  routes: [
    { route_id: "RT-AI-RESP-FIRE", tenant_id: "TEN-GRAND-MERIDIAN", name: "Fire team east service path", use_case: "fire_team_pathing", owner: "Fire Team Alpha", from: "Lobby command point", to: "Kitchen Zone B", eta_minutes: 3, safety: 94, congestion: 22, hazard_avoidance: 91, reserve_capacity: 78, score: 94, steps: ["Use east service elevator override", "Stage at Stairwell B landing", "Enter Kitchen B via service door", "Hold suppression boundary"] },
    { route_id: "RT-AI-EVAC-SPLIT", tenant_id: "TEN-BALA-MFG", name: "Mall crowd split route", use_case: "evacuation_flows", owner: "Security Bravo", from: "Food Court", to: "North and East exits", eta_minutes: 9, safety: 88, congestion: 36, hazard_avoidance: 86, reserve_capacity: 74, score: 91, steps: ["Divide families north", "Send staff east", "Hold escalator entry", "Open exterior assembly lane"] },
  ],
};

export const fallbackResources: TwinResourcesState = {
  reserve_health: 82.8,
  idle_assets: 15,
  best_reallocation_moves: ["Move 2 guards from lobby to Stairwell B.", "Stage Medic Unit 2 near ICU corridor.", "Send drone 2 to platform crowd scan."],
  resources: [
    { resource_id: "RES-GUARDS-01", tenant_id: "TEN-GRAND-MERIDIAN", name: "Security Guards", type: "guards", deployed: 14, idle: 4, overload: 22, reserve_health: 86, best_move: "Move 2 guards from lobby to Stairwell B." },
    { resource_id: "RES-MEDICS-02", tenant_id: "TEN-BALA-HOSP", name: "Medics", type: "medics", deployed: 8, idle: 2, overload: 31, reserve_health: 78, best_move: "Stage Medic Unit 2 near ICU corridor." },
    { resource_id: "RES-HAZMAT-04", tenant_id: "TEN-BALA-UNI", name: "Hazmat Team", type: "hazmat", deployed: 2, idle: 1, overload: 44, reserve_health: 70, best_move: "Request mutual-aid hazmat standby." },
  ],
  overload_zones: [
    { resource_id: "RES-MEDICS-02", tenant_id: "TEN-BALA-HOSP", name: "Medics", type: "medics", deployed: 8, idle: 2, overload: 31, reserve_health: 78, best_move: "Stage Medic Unit 2 near ICU corridor." },
    { resource_id: "RES-HAZMAT-04", tenant_id: "TEN-BALA-UNI", name: "Hazmat Team", type: "hazmat", deployed: 2, idle: 1, overload: 44, reserve_health: 70, best_move: "Request mutual-aid hazmat standby." },
  ],
};

export const fallbackCampus: TwinCampusState = {
  campuses: ["Bala University", "Bala Hospital Demo", "Grand Meridian Hotel", "Nova Mall Group", "MetroCare Campus"],
  average_health: 85,
  occupancy_pressure: 59.5,
  shared_resources: ["Campus Security Pod 1", "Hazmat Team", "Clinical Rapid Unit", "Fire Team Alpha"],
  cascading_risk: 84,
  buildings: [
    { building_id: "BLD-BALA-LAB", tenant_id: "TEN-BALA-UNI", campus: "Bala University", name: "Lab Block C", health: 76, occupancy: 146, pressure: 63, incident: "gas alert", shared_resource: "Hazmat Team" },
    { building_id: "BLD-GM-HOTEL", tenant_id: "TEN-GRAND-MERIDIAN", campus: "Grand Meridian Hotel", name: "Main Hotel", health: 82, occupancy: 428, pressure: 66, incident: "kitchen fire", shared_resource: "Fire Team Alpha" },
    { building_id: "BLD-NOVA-FOOD", tenant_id: "TEN-BALA-MFG", campus: "Nova Mall Group", name: "Food Court Wing", health: 79, occupancy: 1840, pressure: 84, incident: "panic surge", shared_resource: "Security Bravo" },
  ],
  links: [
    { link_id: "LINK-BALA-LAB-LIB", tenant_id: "TEN-BALA-UNI", from: "Lab Block C", to: "Library Tower", route_health: 84, travel_minutes: 6, cascading_risk: 42 },
    { link_id: "LINK-NOVA-FOOD-EAST", tenant_id: "TEN-BALA-MFG", from: "Food Court Wing", to: "East Parking", route_health: 73, travel_minutes: 8, cascading_risk: 61 },
  ],
};

export const fallbackCompare: TwinCompareState = {
  winner: { strategy_id: "STR-CORRIDOR-FIRST", tenant_id: "TEN-GRAND-MERIDIAN", name: "corridor-first containment", casualty_risk: 8, recovery_eta: 42, downtime_hours: 4, financial_loss: 280000, reputation_risk: 28, confidence: 94, winner: true, why: "Contains smoke while keeping evacuation load below stairwell pressure threshold." },
  board_summary: "corridor-first containment wins on casualty risk, recovery ETA, and reputation preservation.",
  strategies: [
    { strategy_id: "STR-CORRIDOR-FIRST", tenant_id: "TEN-GRAND-MERIDIAN", name: "corridor-first containment", casualty_risk: 8, recovery_eta: 42, downtime_hours: 4, financial_loss: 280000, reputation_risk: 28, confidence: 94, winner: true, why: "Contains smoke while keeping evacuation load below stairwell pressure threshold." },
    { strategy_id: "STR-FULL-LOCKDOWN", tenant_id: "TEN-GRAND-MERIDIAN", name: "full lockdown", casualty_risk: 18, recovery_eta: 64, downtime_hours: 9, financial_loss: 910000, reputation_risk: 58, confidence: 77, winner: false, why: "Overconstrains movement and delays suppression team." },
    { strategy_id: "STR-PHASED-EVAC", tenant_id: "TEN-BALA-MFG", name: "phased evacuation", casualty_risk: 11, recovery_eta: 55, downtime_hours: 6, financial_loss: 540000, reputation_risk: 36, confidence: 91, winner: true, why: "Reduces panic and keeps exits below crush pressure." },
  ],
};

export const fallbackReplayIntelligence: TwinReplayIntelligence = {
  lessons: [
    { lesson_id: "LESSON-GM-001", tenant_id: "TEN-GRAND-MERIDIAN", replay_id: "RPL-HOTEL-KITCHEN", mistake: "Approval delayed by 72 seconds for corridor closure.", better_alternative: "Pre-approve smoke-door closure when flame + camera confidence exceed 90 percent.", audit_evidence: "AI council confidence 94, responder ETA 2m, east stairwell pressure below 55 percent.", impact: "Would reduce smoke exposure by 18 percent.", confidence: 93 },
    { lesson_id: "LESSON-NM-001", tenant_id: "TEN-BALA-MFG", replay_id: "RPL-MALL-PANIC", mistake: "Initial announcement sent to all zones instead of food court only.", better_alternative: "Target calm directional message to food court and silent signage to adjacent stores.", audit_evidence: "Crowd density localized to food court; adjacent stores stable.", impact: "Would reduce confusion by 22 percent.", confidence: 91 },
  ],
  what_should_have_happened: ["Pre-approve smoke-door closure when flame + camera confidence exceed 90 percent.", "Target calm directional message to food court and silent signage to adjacent stores."],
  audit_evidence: ["AI council confidence 94, responder ETA 2m, east stairwell pressure below 55 percent.", "Crowd density localized to food court; adjacent stores stable."],
  average_confidence: 92,
  replay: fallbackReplay,
};

export function twinTone(value: number) {
  if (value >= 80) {
    return "border-rose-300/25 bg-rose-400/10 text-rose-100";
  }
  if (value >= 60) {
    return "border-amber-300/25 bg-amber-400/10 text-amber-100";
  }
  return "border-emerald-300/25 bg-emerald-400/10 text-emerald-100";
}

export function secondsLabel(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}
