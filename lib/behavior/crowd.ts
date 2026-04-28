import { apiClient } from "@/lib/core/api-client";

export type CrowdEnvironment = {
  environment_id: string;
  name: string;
  floors: number;
  building_type: string;
};

export type CrowdZone = {
  zone_id: string;
  name: string;
  floor: number;
  occupancy: number;
  capacity: number;
  density: number;
  smoke: number;
  visibility: number;
  panic: number;
  compliance: number;
  exit_width_m: number;
  flow_speed_mps: number;
  stair_load: number;
  corridor_pressure: number;
  blocked: boolean;
  assistance_queue: number;
  primary_exit: string;
  people_per_minute: number;
  congestion_score: number;
  stampede_risk: number;
  pressure_label: "critical" | "high" | "watch" | "controlled" | string;
};

export type CrowdExit = {
  exit_id: string;
  name: string;
  capacity_per_min: number;
  current_load: number;
  pressure: number;
  blocked: boolean;
  smoke: number;
  distance_m: number;
  assembly_point: string;
  remaining_capacity: number;
  collapse_risk: number;
  control_action: string;
};

export type CrowdRoute = {
  route_id: string;
  from_zone: string;
  from_zone_id: string;
  target_exit: string;
  assembly_point: string;
  people_per_minute: number;
  eta_minutes: number;
  safety_score: number;
  compliance_score: number;
  route_logic: string;
  status: string;
  instructions: string[];
};

export type StairLoad = {
  stair_id: string;
  name: string;
  floors_served: string;
  load_percent: number;
  reverse_flow_risk: number;
  status: string;
};

export type ElevatorLogic = {
  elevator_id: string;
  name: string;
  available: boolean;
  priority: string;
  load_percent: number;
  fire_service_mode: boolean;
};

export type SafeZone = {
  safezone_id: string;
  name: string;
  capacity: number;
  assigned: number;
  readiness: number;
  load_percent: number;
  recommended_shift: string;
};

export type CorridorPressure = {
  zone: string;
  pressure: number;
  reverse_flow_risk: number;
};

export type CongestionAlert = {
  zone: string;
  risk: number;
  alert: string;
};

export type CrowdSnapshot = {
  generated_at: string;
  environment: CrowdEnvironment;
  summary: {
    total_occupancy: number;
    avg_density: number;
    avg_flow_people_per_min: number;
    max_corridor_pressure: number;
    stampede_prevention_score: number;
    highest_risk_zone: string;
    safe_route_confidence: number;
    intervention: string;
  };
  occupancy_grid: CrowdZone[];
  exit_pressure: CrowdExit[];
  routes: CrowdRoute[];
  stairwell_load: StairLoad[];
  elevator_logic: ElevatorLogic[];
  safe_zones: SafeZone[];
  corridor_pressure: CorridorPressure[];
  congestion_alerts: CongestionAlert[];
};

export type EvacuationSnapshot = {
  generated_at: string;
  environment: CrowdEnvironment;
  estimated_full_evac_minutes: number;
  people_cleared_percent: number;
  people_cleared: number;
  people_remaining: number;
  blocked_zones: string[];
  best_exit_plans: CrowdRoute[];
  special_assistance_queue: number;
  risk_zones: CongestionAlert[];
  reentry: {
    generated_at: string;
    zones: Array<{
      zone: string;
      readiness: number;
      earliest_reentry_minutes: number;
      requirement: string;
      status: string;
    }>;
  };
  recovery_timeline: Array<{
    phase: string;
    status: string;
    confidence: number;
  }>;
};

export type CrowdMutationResponse = {
  ok: boolean;
  message: string;
  data: Record<string, unknown>;
};

export function calculateCrowdFlow(zone: Pick<CrowdZone, "density" | "smoke" | "visibility" | "panic" | "exit_width_m" | "flow_speed_mps" | "stair_load" | "compliance" | "blocked">) {
  const base = zone.exit_width_m * 58 * zone.flow_speed_mps;
  const densityFactor = Math.max(0.42, 1 - zone.density * 0.0046);
  const smokeFactor = Math.max(0.48, 1 - zone.smoke * 0.0042);
  const visibilityFactor = 0.58 + zone.visibility / 220;
  const panicFactor = Math.max(0.62, 1 - zone.panic * 0.0028);
  const stairFactor = Math.max(0.55, 1 - zone.stair_load * 0.0026);
  const complianceFactor = 0.82 + zone.compliance / 260;
  const blockedFactor = zone.blocked ? 0.56 : 1;
  return Math.max(6, Math.round(base * densityFactor * smokeFactor * visibilityFactor * panicFactor * stairFactor * complianceFactor * blockedFactor));
}

export function forecastCongestion(zone: Pick<CrowdZone, "density" | "corridor_pressure" | "stair_load" | "panic" | "smoke" | "blocked">) {
  return Math.min(
    100,
    Math.max(0, Math.round(zone.density * 0.32 + zone.corridor_pressure * 0.28 + zone.stair_load * 0.18 + zone.panic * 0.14 + zone.smoke * 0.08 + (zone.blocked ? 18 : 0))),
  );
}

export function optimizeRoutes(routes: CrowdRoute[]) {
  return [...routes].sort((a, b) => b.safety_score - a.safety_score || a.eta_minutes - b.eta_minutes);
}

export function balanceSafeZones(safeZones: SafeZone[]) {
  return [...safeZones].sort((a, b) => a.load_percent - b.load_percent || b.readiness - a.readiness);
}

export function estimateReentry(minutes: number, readiness: number) {
  if (readiness >= 82) {
    return `controlled re-entry window in ${minutes} min`;
  }
  if (readiness >= 66) {
    return "hold for responder sweep";
  }
  return "do not re-enter";
}

export const fallbackCrowdSnapshot: CrowdSnapshot = {
  generated_at: "2026-04-26T00:00:00.000Z",
  environment: { environment_id: "CROWD-HOTEL-12", name: "12 Floor Hotel", floors: 12, building_type: "hospitality" },
  summary: {
    total_occupancy: 1740,
    avg_density: 76,
    avg_flow_people_per_min: 83,
    max_corridor_pressure: 78,
    stampede_prevention_score: 76,
    highest_risk_zone: "Kitchen Zone B",
    safe_route_confidence: 78,
    intervention: "Throttle Stairwell C, split Ballroom flow, and reserve Fire Service Lift for assisted evacuation.",
  },
  occupancy_grid: [
    { zone_id: "HOTEL-KITCHEN-B", name: "Kitchen Zone B", floor: 3, occupancy: 74, capacity: 110, density: 67, smoke: 69, visibility: 42, panic: 67, compliance: 64, exit_width_m: 1.4, flow_speed_mps: 0.44, stair_load: 83, corridor_pressure: 78, blocked: true, assistance_queue: 9, primary_exit: "HOTEL-STAIR-C", people_per_minute: 12, congestion_score: 76, stampede_risk: 65, pressure_label: "high" },
    { zone_id: "HOTEL-BALLROOM", name: "Grand Ballroom", floor: 2, occupancy: 960, capacity: 1150, density: 84, smoke: 12, visibility: 78, panic: 55, compliance: 66, exit_width_m: 6.2, flow_speed_mps: 0.76, stair_load: 36, corridor_pressure: 71, blocked: false, assistance_queue: 45, primary_exit: "HOTEL-EVENT-EXIT", people_per_minute: 211, congestion_score: 68, stampede_risk: 65, pressure_label: "watch" },
    { zone_id: "HOTEL-LOBBY", name: "Main Lobby", floor: 1, occupancy: 520, capacity: 640, density: 81, smoke: 4, visibility: 91, panic: 39, compliance: 76, exit_width_m: 5.4, flow_speed_mps: 0.92, stair_load: 22, corridor_pressure: 57, blocked: false, assistance_queue: 21, primary_exit: "HOTEL-SOUTH-EXIT", people_per_minute: 257, congestion_score: 53, stampede_risk: 55, pressure_label: "watch" },
    { zone_id: "HOTEL-F8-EAST", name: "Floor 8 East Wing", floor: 8, occupancy: 186, capacity: 260, density: 72, smoke: 16, visibility: 74, panic: 42, compliance: 70, exit_width_m: 1.9, flow_speed_mps: 0.68, stair_load: 64, corridor_pressure: 59, blocked: false, assistance_queue: 12, primary_exit: "HOTEL-STAIR-B", people_per_minute: 50, congestion_score: 59, stampede_risk: 57, pressure_label: "watch" },
  ],
  exit_pressure: [
    { exit_id: "HOTEL-STAIR-C", name: "Stairwell C", capacity_per_min: 104, current_load: 122, pressure: 97, blocked: false, smoke: 38, distance_m: 55, assembly_point: "Service Yard", remaining_capacity: 0, collapse_risk: 77, control_action: "divert 22% flow to alternate exit" },
    { exit_id: "HOTEL-EVENT-EXIT", name: "Event Wing Exit", capacity_per_min: 510, current_load: 438, pressure: 86, blocked: false, smoke: 9, distance_m: 62, assembly_point: "Garden Court", remaining_capacity: 72, collapse_risk: 64, control_action: "divert 22% flow to alternate exit" },
    { exit_id: "HOTEL-STAIR-B", name: "Stairwell B", capacity_per_min: 132, current_load: 108, pressure: 82, blocked: false, smoke: 14, distance_m: 48, assembly_point: "North Assembly", remaining_capacity: 24, collapse_risk: 62, control_action: "maintain metered flow" },
    { exit_id: "HOTEL-SOUTH-EXIT", name: "South Lobby Exit", capacity_per_min: 430, current_load: 264, pressure: 61, blocked: false, smoke: 3, distance_m: 35, assembly_point: "South Forecourt", remaining_capacity: 166, collapse_risk: 44, control_action: "maintain metered flow" },
  ],
  routes: [
    { route_id: "ROUTE-CROWD-HOTEL-12-3", from_zone: "Kitchen Zone B", from_zone_id: "HOTEL-KITCHEN-B", target_exit: "Stairwell C", assembly_point: "Service Yard", people_per_minute: 12, eta_minutes: 11, safety_score: 52, compliance_score: 64, route_logic: "least-crowd + lowest-smoke + highest-compliance path", status: "reroute required", instructions: ["Meter Kitchen Zone B into Stairwell C", "Use calm directional signage and staff hand signals", "Hold reverse flow until pressure drops below 70"] },
    { route_id: "ROUTE-CROWD-HOTEL-12-4", from_zone: "Grand Ballroom", from_zone_id: "HOTEL-BALLROOM", target_exit: "Event Wing Exit", assembly_point: "Garden Court", people_per_minute: 211, eta_minutes: 5, safety_score: 76, compliance_score: 66, route_logic: "least-crowd + lowest-smoke + highest-compliance path", status: "preferred", instructions: ["Split Ballroom flow into Event Wing Exit", "Open garden-side lanes", "Meter families first"] },
    { route_id: "ROUTE-CROWD-HOTEL-12-2", from_zone: "Main Lobby", from_zone_id: "HOTEL-LOBBY", target_exit: "South Lobby Exit", assembly_point: "South Forecourt", people_per_minute: 257, eta_minutes: 3, safety_score: 87, compliance_score: 76, route_logic: "least-crowd + lowest-smoke + highest-compliance path", status: "preferred", instructions: ["Keep lobby flow moving south", "Prevent return traffic", "Use PA repetition every 45 sec"] },
  ],
  stairwell_load: [
    { stair_id: "HOTEL-STAIR-C", name: "Stairwell C", floors_served: "1-12", load_percent: 91, reverse_flow_risk: 43, status: "overloaded" },
    { stair_id: "HOTEL-STAIR-B", name: "Stairwell B", floors_served: "1-12", load_percent: 76, reverse_flow_risk: 28, status: "controlled descent" },
    { stair_id: "HOTEL-SERVICE", name: "Service Stairwell", floors_served: "B2-12", load_percent: 37, reverse_flow_risk: 12, status: "reserve route" },
  ],
  elevator_logic: [
    { elevator_id: "HOTEL-GUEST-LIFT", name: "Guest Lift Bank", available: false, priority: "locked during fire posture", load_percent: 0, fire_service_mode: true },
    { elevator_id: "HOTEL-FIRE-LIFT", name: "Fire Service Lift", available: true, priority: "responders and assisted evacuation", load_percent: 44, fire_service_mode: true },
  ],
  safe_zones: [
    { safezone_id: "HOTEL-SERVICE-YARD", name: "Service Yard", capacity: 520, assigned: 232, readiness: 82, load_percent: 45, recommended_shift: "balanced" },
    { safezone_id: "HOTEL-FORECOURT", name: "South Forecourt", capacity: 1800, assigned: 960, readiness: 96, load_percent: 53, recommended_shift: "send next wave here" },
    { safezone_id: "HOTEL-GARDEN", name: "Garden Court", capacity: 1200, assigned: 790, readiness: 90, load_percent: 66, recommended_shift: "balanced" },
  ],
  corridor_pressure: [
    { zone: "Kitchen Zone B", pressure: 78, reverse_flow_risk: 66 },
    { zone: "Grand Ballroom", pressure: 71, reverse_flow_risk: 61 },
    { zone: "Main Lobby", pressure: 57, reverse_flow_risk: 49 },
    { zone: "Floor 8 East Wing", pressure: 59, reverse_flow_risk: 51 },
  ],
  congestion_alerts: [
    { zone: "Kitchen Zone B", risk: 76, alert: "Meter flow and redirect to secondary exit" },
  ],
};

export const fallbackEvacuationSnapshot: EvacuationSnapshot = {
  generated_at: fallbackCrowdSnapshot.generated_at,
  environment: fallbackCrowdSnapshot.environment,
  estimated_full_evac_minutes: 20,
  people_cleared_percent: 42,
  people_cleared: 731,
  people_remaining: 1009,
  blocked_zones: ["Kitchen Zone B"],
  best_exit_plans: fallbackCrowdSnapshot.routes,
  special_assistance_queue: 87,
  risk_zones: fallbackCrowdSnapshot.congestion_alerts,
  reentry: {
    generated_at: fallbackCrowdSnapshot.generated_at,
    zones: [
      { zone: "Main Lobby", readiness: 88, earliest_reentry_minutes: 18, requirement: "air-quality clear + corridor pressure stable + responder sweep", status: "ready soon" },
      { zone: "Grand Ballroom", readiness: 77, earliest_reentry_minutes: 42, requirement: "air-quality clear + corridor pressure stable + responder sweep", status: "hold" },
      { zone: "Kitchen Zone B", readiness: 51, earliest_reentry_minutes: 75, requirement: "air-quality clear + corridor pressure stable + responder sweep", status: "do not re-enter" },
    ],
  },
  recovery_timeline: [
    { phase: "0-10 min", status: "controlled evacuation waves", confidence: 88 },
    { phase: "10-25 min", status: "assisted sweeps and stairwell pressure relief", confidence: 84 },
    { phase: "25-45 min", status: "hazard verification and zone isolation", confidence: 79 },
    { phase: "45-75 min", status: "conditional re-entry for cleared zones", confidence: 73 },
  ],
};

export function getCrowdCommand() {
  return apiClient.requestData<{ data: CrowdSnapshot }>("/behavior/crowd", {
    priority: "high",
    cacheTtlMs: 8_000,
  });
}

export function getCrowdOccupancy() {
  return apiClient.requestData<{ data: { zones: CrowdZone[]; total_occupancy: number } }>("/behavior/occupancy", {
    priority: "normal",
    cacheTtlMs: 8_000,
  });
}

export function getCrowdRoutes() {
  return apiClient.requestData<{ data: { routes: CrowdRoute[] } }>("/behavior/routes", {
    priority: "normal",
    cacheTtlMs: 8_000,
  });
}

export function getCrowdExits() {
  return apiClient.requestData<{ data: { exits: CrowdExit[] } }>("/behavior/exits", {
    priority: "normal",
    cacheTtlMs: 8_000,
  });
}

export function getEvacuationCenter() {
  return apiClient.requestData<{ data: EvacuationSnapshot }>("/behavior/evacuation", {
    priority: "high",
    cacheTtlMs: 10_000,
  });
}

export function runCrowdSimulation(scenario = "multi_floor_hotel_fire") {
  return apiClient.requestData<CrowdMutationResponse>("/behavior/simulate", {
    method: "POST",
    body: { scenario },
    priority: "high",
  });
}

export function recomputeCrowdRoutes(avoid_zone = "HOTEL-KITCHEN-B") {
  return apiClient.requestData<CrowdMutationResponse>("/behavior/route/recompute", {
    method: "POST",
    body: { avoid_zone },
    priority: "high",
  });
}
