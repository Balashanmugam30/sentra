import { BUILDING_NAME } from "./constants";
import { buildRoutePlan, PRIMARY_BLOCKED_ZONE } from "./routing";
import type { DemoScenario, IncidentType, MobileIncident, MobileRoute, MobileRouteStep, SystemStatus } from "./types";

export type DemoScenarioSnapshot = {
  blockedZones: string[];
  confidence: number;
  eta: number;
  incident: MobileIncident | null;
  incidentType: IncidentType;
  occupancy: number;
  responders: number;
  route: MobileRoute;
  routeSteps: MobileRouteStep[];
  severity: SystemStatus;
  systemStatus: SystemStatus;
};

function createIncident(type: IncidentType, at: string): MobileIncident {
  const shared = {
    detectedAt: at,
    floor: "3",
    id: "INC-KITCHEN-ZONE-B",
    severity: "emergency" as SystemStatus,
    severityLevel: "critical" as const,
    updatedAt: at,
    zone: "Kitchen Zone B",
  };

  if (type === "gas_leak") {
    return {
      ...shared,
      instructions: ["Avoid ignition sources.", "Move toward the nearest signed exit.", "Wait for staff verification before re-entry."],
      title: "GAS LEAK",
      type,
    };
  }

  if (type === "intruder") {
    return {
      ...shared,
      instructions: ["Move away from public corridors.", "Follow staff lockdown instructions.", "Share status only when safe."],
      title: "INTRUDER ALERT",
      type,
    };
  }

  if (type === "medical") {
    return {
      ...shared,
      instructions: ["Clear the nearby corridor.", "Keep the patient calm.", "Responders are being routed to your location."],
      title: "MEDICAL EMERGENCY",
      type,
    };
  }

  return {
    ...shared,
    instructions: ["Leave belongings behind.", "Follow the blue route to Stairwell B.", "Do not use elevators or return to Zone B."],
    title: "FIRE DETECTED",
    type: "fire",
  };
}

export function buildDemoScenario(scenario: DemoScenario, at: string): DemoScenarioSnapshot {
  if (scenario === "safe") {
    const plan = buildRoutePlan([]);
    return {
      blockedZones: [],
      confidence: 98,
      eta: plan.route.etaSeconds,
      incident: null,
      incidentType: "none",
      occupancy: 428,
      responders: 0,
      route: plan.route,
      routeSteps: plan.steps,
      severity: "safe",
      systemStatus: "safe",
    };
  }

  if (scenario === "warning_smoke") {
    const plan = buildRoutePlan([]);
    return {
      blockedZones: [],
      confidence: 91,
      eta: plan.route.etaSeconds,
      incident: {
        detectedAt: at,
        floor: "3",
        id: "INC-SMOKE-ZONE-B",
        instructions: ["Stay aware of staff instructions.", "Keep exits visible.", "Prepare to move if alert escalates."],
        severity: "warning",
        severityLevel: "medium",
        title: "SMOKE WATCH",
        type: "smoke",
        updatedAt: at,
        zone: "Kitchen Zone B",
      },
      incidentType: "smoke",
      occupancy: 428,
      responders: 2,
      route: plan.route,
      routeSteps: plan.steps,
      severity: "warning",
      systemStatus: "warning",
    };
  }

  if (scenario === "corridor_blocked") {
    const plan = buildRoutePlan([PRIMARY_BLOCKED_ZONE]);
    return {
      blockedZones: [PRIMARY_BLOCKED_ZONE],
      confidence: 89,
      eta: plan.route.etaSeconds,
      incident: createIncident("fire", at),
      incidentType: "fire",
      occupancy: 428,
      responders: 4,
      route: plan.route,
      routeSteps: plan.steps,
      severity: "emergency",
      systemStatus: "emergency",
    };
  }

  const plan = buildRoutePlan([]);
  return {
    blockedZones: [],
    confidence: 94,
    eta: plan.route.etaSeconds,
    incident: createIncident("fire", at),
    incidentType: "fire",
    occupancy: 428,
    responders: 4,
    route: plan.route,
    routeSteps: plan.steps,
    severity: "emergency",
    systemStatus: "emergency",
  };
}

export const DEMO_SCENARIO_LABELS: Record<DemoScenario, { label: string; description: string }> = {
  active_fire: {
    description: `${BUILDING_NAME} Kitchen Zone B emergency posture.`,
    label: "Active fire",
  },
  corridor_blocked: {
    description: "Primary corridor blocked and route recomputed.",
    label: "Corridor blocked",
  },
  safe: {
    description: "Normal operations with verified exits.",
    label: "Safe",
  },
  warning_smoke: {
    description: "Smoke anomaly watch with responders staged.",
    label: "Smoke watch",
  },
};
