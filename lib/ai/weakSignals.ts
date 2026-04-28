import type { LearningFutureBranch, LearningWeakSignal } from "@/lib/ai/types";

export function buildWeakSignals(): LearningWeakSignal[] {
  return [
    {
      signal_id: "WS-101",
      signal: "Kitchen Zone B temperature rising 1.8x faster than baseline",
      source: "IoT telemetry",
      probability: 76,
      time_to_risk: "18 min",
      recommended_action: "Pre-stage responder and inspect ventilation hood.",
    },
    {
      signal_id: "WS-102",
      signal: "Repeated panic-button tests clustered around Floor 8",
      source: "Mobile operations",
      probability: 64,
      time_to_risk: "42 min",
      recommended_action: "Dispatch staff wellness check and verify device status.",
    },
    {
      signal_id: "WS-103",
      signal: "Route congestion increasing near east stairwell during peak movement",
      source: "Routing engine",
      probability: 71,
      time_to_risk: "25 min",
      recommended_action: "Open auxiliary marshal lane before alarm state.",
    },
  ];
}

export function buildFutureBranches(): LearningFutureBranch[] {
  return [
    {
      window: "Next 5 min",
      branch: "Fire contained if suppression starts within two minutes",
      probability: 82,
      impact: "Low spread, moderate disruption",
    },
    {
      window: "Next 15 min",
      branch: "Smoke spreads west wing if corridor remains blocked",
      probability: 63,
      impact: "Higher evacuation pressure and responder congestion",
    },
    {
      window: "Next 1 hour",
      branch: "External media pressure rises if guest-facing alert leaks early",
      probability: 47,
      impact: "Reputation risk; executive comms needed",
    },
    {
      window: "Next 6 hours",
      branch: "Re-entry readiness depends on ventilation reset and audit timeline",
      probability: 74,
      impact: "Business continuity and insurance evidence",
    },
  ];
}
