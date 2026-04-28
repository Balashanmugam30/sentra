"use client";

import { useEffect, useState } from "react";

import {
  getBehaviorCompliance,
  getBehaviorExecutive,
  getBehaviorFreeze,
  getBehaviorPanic,
  getBehaviorRecommendations,
  getBehaviorSummary,
  getBehaviorVulnerable,
  getBehaviorZones,
  runBehaviorModel,
} from "@/lib/behavior/api";
import type { BehaviorExecutive, BehaviorMetricData, BehaviorRecommendation, BehaviorSummary, BehaviorZone } from "@/lib/behavior/types";

const LOCAL_TIMESTAMP = "2026-04-26T00:00:00.000Z";

const localZones: BehaviorZone[] = [
  {
    zone_id: "BEH-FOOD-COURT",
    tenant_id: "TEN-GRAND-MERIDIAN",
    name: "Food Court",
    population: 680,
    density: 93,
    exits: 3,
    visible_exits: 48,
    smoke_level: 26,
    fire_severity: 32,
    alarm_clarity: 64,
    alarm_status: "mixed PA and staff instructions",
    language_mix: ["English", "Hindi", "Malayalam", "Arabic"],
    avg_age_band: "families",
    mobility_percent: 13,
    visibility_score: 62,
    noise_level: 88,
    previous_alerts: 3,
    leadership_presence: 42,
    conflicting_instructions: 31,
    time_pressure: 69,
    updated_at: LOCAL_TIMESTAMP,
    panic_score: 53,
    freeze_score: 38,
    compliance: { obey_immediately: 63, delay_then_comply: 51, ignore_warning: 38, move_opposite_direction: 45 },
    vulnerability_score: 39,
    vulnerable_occupants: 265,
    herd_score: 67,
    bottleneck_score: 71,
    recommended_communication: "Split-flow signage, responder marshals, and exit balancing language",
    intervention: "Open secondary exit flow and station responder marshal",
    explanation: "Food Court risk is driven by high density, low exit visibility, and mixed instructions.",
  },
  {
    zone_id: "BEH-STADIUM-A",
    tenant_id: "TEN-GRAND-MERIDIAN",
    name: "Stadium Gate A",
    population: 1220,
    density: 96,
    exits: 5,
    visible_exits: 52,
    smoke_level: 4,
    fire_severity: 12,
    alarm_clarity: 58,
    alarm_status: "crowd audio interference",
    language_mix: ["English", "Hindi", "Kannada"],
    avg_age_band: "young adults",
    mobility_percent: 5,
    visibility_score: 70,
    noise_level: 94,
    previous_alerts: 2,
    leadership_presence: 34,
    conflicting_instructions: 36,
    time_pressure: 61,
    updated_at: LOCAL_TIMESTAMP,
    panic_score: 45,
    freeze_score: 37,
    compliance: { obey_immediately: 57, delay_then_comply: 52, ignore_warning: 40, move_opposite_direction: 46 },
    vulnerability_score: 43,
    vulnerable_occupants: 525,
    herd_score: 70,
    bottleneck_score: 75,
    recommended_communication: "Split-flow signage, responder marshals, and exit balancing language",
    intervention: "Open secondary exit flow and station responder marshal",
    explanation: "Stadium Gate A risk is driven by crowd audio, density, and herd movement.",
  },
  {
    zone_id: "BEH-ICU-WING",
    tenant_id: "TEN-GRAND-MERIDIAN",
    name: "ICU Wing",
    population: 78,
    density: 61,
    exits: 2,
    visible_exits: 58,
    smoke_level: 8,
    fire_severity: 21,
    alarm_clarity: 76,
    alarm_status: "clinical quiet alert",
    language_mix: ["English", "Tamil"],
    avg_age_band: "elderly and clinical",
    mobility_percent: 46,
    visibility_score: 79,
    noise_level: 38,
    previous_alerts: 1,
    leadership_presence: 88,
    conflicting_instructions: 9,
    time_pressure: 57,
    updated_at: LOCAL_TIMESTAMP,
    panic_score: 33,
    freeze_score: 27,
    compliance: { obey_immediately: 75, delay_then_comply: 46, ignore_warning: 21, move_opposite_direction: 29 },
    vulnerability_score: 43,
    vulnerable_occupants: 34,
    herd_score: 35,
    bottleneck_score: 42,
    recommended_communication: "Clinical calm voice alert with responder escort and repeated bedside instructions",
    intervention: "Dispatch assistance team and preserve slow-mobility lane",
    explanation: "ICU Wing risk is driven by mobility assistance and clinical constraints.",
  },
];

const localSummary: BehaviorSummary = {
  generated_at: LOCAL_TIMESTAMP,
  human_risk_score: 55,
  panic_index: 44,
  freeze_risk: 34,
  compliance_confidence: 65,
  evacuation_confidence: 58,
  vulnerable_occupants: 824,
  bottleneck_risk: 63,
  highest_risk_zone: "Stadium Gate A",
  recommended_style: "Split-flow signage, responder marshals, and exit balancing language",
  trust_score: 91,
  population_modeled: 1_978,
  at_risk_population: 1_088,
};

const localRecommendations: BehaviorRecommendation[] = localZones.map((zone, index) => ({
  recommendation_id: `BEH-LOCAL-${index + 1}`,
  zone: zone.name,
  priority: index <= 1 ? "critical" : "high",
  message_style: zone.recommended_communication,
  action: zone.intervention,
  confidence: 91 - index * 4,
  why: zone.explanation,
}));

const localExecutive: BehaviorExecutive = {
  generated_at: LOCAL_TIMESTAMP,
  occupant_stability_score: 70,
  panic_spread_risk: 44,
  evacuation_confidence: 58,
  at_risk_population: 1_088,
  recommended_executive_actions: [
    "Authorize responder marshals for Food Court and Stadium Gate A",
    "Switch high-density zones to authoritative multilingual instructions",
    "Preserve ICU assisted evacuation lane and clinical quiet-alert posture",
  ],
  public_safety_narrative:
    "Sentra is modeling human movement, hesitation, and assistance needs in real time so operators can prevent panic, reduce bottlenecks, and protect vulnerable occupants.",
};

type BehaviorState = {
  summary: BehaviorSummary;
  zones: BehaviorZone[];
  panic: BehaviorMetricData;
  freeze: BehaviorMetricData;
  compliance: BehaviorMetricData;
  vulnerable: BehaviorMetricData;
  recommendations: BehaviorRecommendation[];
  executive: BehaviorExecutive;
  delayTimeline: Array<Record<string, unknown>>;
  trustLedger: Array<Record<string, unknown>>;
  loading: boolean;
  error: string | null;
  busyAction: string | null;
};

const initialState: BehaviorState = {
  summary: localSummary,
  zones: localZones,
  panic: { global_panic_score: localSummary.panic_index, zones: localZones.map((zone) => ({ zone: zone.name, score: zone.panic_score, drivers: zone.explanation })) },
  freeze: { global_freeze_score: localSummary.freeze_risk, zones: localZones.map((zone) => ({ zone: zone.name, score: zone.freeze_score, intervention: zone.intervention })) },
  compliance: { zones: localZones.map((zone) => ({ zone: zone.name, ...zone.compliance })), forecast: "High-density zones need leader cues and exit balancing." },
  vulnerable: { total_vulnerable_occupants: localSummary.vulnerable_occupants, zones: localZones.map((zone) => ({ zone: zone.name, count: zone.vulnerable_occupants })) },
  recommendations: localRecommendations,
  executive: localExecutive,
  delayTimeline: [
    { time: "0-2 min", risk: 44, event: "Alarm interpretation and first movement split" },
    { time: "2-5 min", risk: 63, event: "Exit choice convergence and herd pressure" },
    { time: "5-10 min", risk: 34, event: "Hesitation pockets require responder prompts" },
    { time: "10-20 min", risk: 31, event: "Residual vulnerable occupants need assisted sweep" },
  ],
  trustLedger: [
    { signal: "Occupancy and density", confidence: 94, explanation: "Derived from zone population, crowd density, and exit pressure." },
    { signal: "Alarm clarity", confidence: 89, explanation: "Modeled from synchronized PA/mobile/signage quality." },
    { signal: "Vulnerability estimate", confidence: 86, explanation: "Uses mobility percentage, age band, and visibility constraints." },
    { signal: "Compliance forecast", confidence: 84, explanation: "Weighted by leadership presence, instruction clarity, and noise." },
  ],
  loading: true,
  error: null,
  busyAction: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: BehaviorState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshBehavior() {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  sharedState = { ...sharedState, loading: true };
  notify();
  refreshInFlight = (async () => {
    try {
      const [summary, zones, panic, freeze, compliance, vulnerable, recommendations, executive] = await Promise.all([
        getBehaviorSummary(),
        getBehaviorZones(),
        getBehaviorPanic(),
        getBehaviorFreeze(),
        getBehaviorCompliance(),
        getBehaviorVulnerable(),
        getBehaviorRecommendations(),
        getBehaviorExecutive(),
      ]);

      sharedState = {
        ...sharedState,
        summary: summary.summary,
        zones: zones.zones,
        panic: panic.data,
        freeze: freeze.data,
        compliance: compliance.data,
        vulnerable: vulnerable.data,
        recommendations: recommendations.recommendations,
        executive: executive.data,
        loading: false,
        error: null,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: error instanceof Error ? error.message : "Human behavior intelligence is reconnecting",
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();
  return refreshInFlight;
}

async function withBehaviorAction(label: string, action: () => Promise<unknown>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    await action();
    sharedState = { ...sharedState, busyAction: null };
    notify();
    await refreshBehavior();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Behavior action failed",
    };
    notify();
  }
}

export function useBehavior() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    void refreshBehavior();
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    refresh: refreshBehavior,
    runModel: (scenario = "active_evacuation") => withBehaviorAction("run-model", () => runBehaviorModel(scenario)),
  };
}

