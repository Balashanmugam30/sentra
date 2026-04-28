import type { MobileRoute, MobileRouteStep } from "./types";

export const PRIMARY_BLOCKED_ZONE = "Kitchen Corridor B";

const primarySteps: MobileRouteStep[] = [
  {
    detail: "Stay on the blue-lit corridor and keep to the right side.",
    distanceMeters: 18,
    id: "STEP-PRIMARY-1",
    status: "current",
    title: "Walk forward 18m",
  },
  {
    detail: "Use the signed fire stairwell. Do not use elevators.",
    distanceMeters: 24,
    id: "STEP-PRIMARY-2",
    status: "upcoming",
    title: "Turn left to Stairwell B",
  },
  {
    detail: "Hold the handrail and follow floor marshal guidance.",
    distanceMeters: 16,
    id: "STEP-PRIMARY-3",
    status: "upcoming",
    title: "Descend 1 floor",
  },
  {
    detail: "Proceed to the verified assembly desk outside the south gate.",
    distanceMeters: 30,
    id: "STEP-PRIMARY-4",
    status: "upcoming",
    title: "Exit South Gate",
  },
];

const reroutedSteps: MobileRouteStep[] = [
  {
    detail: "Primary corridor is blocked. Move toward the service hallway lights.",
    distanceMeters: 12,
    id: "STEP-REROUTE-1",
    status: "current",
    title: "Move to Service Hall C",
  },
  {
    detail: "Bypass Kitchen Corridor B and follow the amber route markers.",
    distanceMeters: 34,
    id: "STEP-REROUTE-2",
    status: "upcoming",
    title: "Bypass hazard zone",
  },
  {
    detail: "Use the staff stairwell. Responders are holding the landing clear.",
    distanceMeters: 22,
    id: "STEP-REROUTE-3",
    status: "upcoming",
    title: "Enter Stairwell C",
  },
  {
    detail: "Check in with the floor marshal at the courtyard muster point.",
    distanceMeters: 36,
    id: "STEP-REROUTE-4",
    status: "upcoming",
    title: "Exit East Courtyard",
  },
];

export function buildRoutePlan(blockedZones: string[]): { reason: string | null; route: MobileRoute; steps: MobileRouteStep[] } {
  const rerouted = blockedZones.includes(PRIMARY_BLOCKED_ZONE);

  if (rerouted) {
    return {
      reason: "Route updated due corridor hazard",
      route: {
        confidence: 89,
        congestionLevel: "moderate",
        destination: "East Courtyard assembly point",
        distanceMeters: 104,
        etaMinutes: 3,
        etaSeconds: 165,
        id: "ROUTE-DEMO-REROUTED",
        safetyScore: 88,
      },
      steps: reroutedSteps,
    };
  }

  return {
    reason: null,
    route: {
      confidence: 94,
      congestionLevel: "low",
      destination: "South Gate assembly point",
      distanceMeters: 88,
      etaMinutes: 3,
      etaSeconds: 130,
      id: "ROUTE-DEMO-SAFE",
      safetyScore: 96,
    },
    steps: primarySteps,
  };
}
