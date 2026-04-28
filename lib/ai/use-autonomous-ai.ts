"use client";

import { useEffect, useState } from "react";

import { DEFAULT_REFRESH_MS, LIVE_POLLING_ENABLED } from "@/lib/core/refresh-config";
import {
  approveAIRecommendation,
  compareAIStrategies,
  executeAIPlan,
  executeAICopilotIntent,
  getAIAdvancedMemory,
  getAIBehavior,
  getAICampaign,
  getAICascade,
  getAIComms,
  getAIConfidence,
  getAICouncil,
  getAICopilot,
  getAIDebateV2,
  getAIExplanations,
  getAIFacilityBrain,
  getAIMemory,
  getAINegotiation,
  getAIOrchestration,
  getAIPolicies,
  getAIPredictiveForecast,
  getAIRecommendations,
  getAIResources,
  getAIScenarios,
  getAISpecialistAgents,
  getAISupremacyScore,
  getAISwarm,
  getAITimeline,
  getAITrust,
  getAIWeakSignals,
  getAutonomousLive,
  overrideAIPlan,
  rejectAIRecommendation,
  retrainAIPolicies,
  runAIForecast,
  runAICycle,
  runAIDebateV2,
  runAICinematicDemo,
  runAIStrategicLearningCycle,
  setAIResponseAutonomyMode,
  simulateAICampaign,
  testAICascade,
  testAIWeakSignal,
  testAIScenario,
} from "@/lib/ai/api";
import type {
  AIStrategicScenario,
  AITestScenario,
  AdvancedMemoryResponse,
  AutonomyMode,
  AutonomousLiveResponse,
  BehaviorResponse,
  CampaignPlanResponse,
  CascadeResponse,
  CinematicDemoResponse,
  CommsBrainResponse,
  ConfidenceDriftResponse,
  CopilotResponse,
  CouncilSnapshot,
  DebateV2Response,
  ExecutiveIntent,
  ExplanationsResponse,
  FacilityBrainResponse,
  MemoryResponse,
  NegotiationResponse,
  OrchestrationResponse,
  PolicyEvolutionResponse,
  PredictiveForecastResponse,
  RecommendationsResponse,
  ResourceRebalancerResponse,
  ScenarioBranchesResponse,
  SpecialistAgentsResponse,
  StrategyTimelineResponse,
  SupremacyScoreResponse,
  SwarmResponse,
  TrustDashboardResponse,
  WeakSignalsResponse,
} from "@/lib/ai/types";

type AutonomousAIState = {
  live: AutonomousLiveResponse | null;
  recommendations: RecommendationsResponse | null;
  council: CouncilSnapshot | null;
  explanations: ExplanationsResponse | null;
  memory: MemoryResponse | null;
  forecast: PredictiveForecastResponse | null;
  scenarios: ScenarioBranchesResponse | null;
  orchestration: OrchestrationResponse | null;
  resources: ResourceRebalancerResponse | null;
  facilityBrain: FacilityBrainResponse | null;
  comms: CommsBrainResponse | null;
  timeline: StrategyTimelineResponse | null;
  advancedMemory: AdvancedMemoryResponse | null;
  specialistAgents: SpecialistAgentsResponse | null;
  debateV2: DebateV2Response | null;
  weakSignals: WeakSignalsResponse | null;
  policies: PolicyEvolutionResponse | null;
  confidence: ConfidenceDriftResponse | null;
  campaign: CampaignPlanResponse | null;
  trust: TrustDashboardResponse | null;
  swarm: SwarmResponse | null;
  cascade: CascadeResponse | null;
  copilot: CopilotResponse | null;
  behavior: BehaviorResponse | null;
  negotiation: NegotiationResponse | null;
  supremacy: SupremacyScoreResponse | null;
  cinematicDemo: CinematicDemoResponse | null;
  loading: boolean;
  error: string | null;
  busyAction: string | null;
  lastAction: string | null;
};

const initialState: AutonomousAIState = {
  live: null,
  recommendations: null,
  council: null,
  explanations: null,
  memory: null,
  forecast: null,
  scenarios: null,
  orchestration: null,
  resources: null,
  facilityBrain: null,
  comms: null,
  timeline: null,
  advancedMemory: null,
  specialistAgents: null,
  debateV2: null,
  weakSignals: null,
  policies: null,
  confidence: null,
  campaign: null,
  trust: null,
  swarm: null,
  cascade: null,
  copilot: null,
  behavior: null,
  negotiation: null,
  supremacy: null,
  cinematicDemo: null,
  loading: true,
  error: null,
  busyAction: null,
  lastAction: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
let pollingInterval: number | null = null;
const subscribers = new Set<(state: AutonomousAIState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

async function refreshSharedAI() {
  if (refreshInFlight) {
    return refreshInFlight;
  }
  sharedState = { ...sharedState, loading: true };
  notify();
  refreshInFlight = (async () => {
    try {
      const [
        live,
        recommendations,
        council,
        explanations,
        memory,
        forecast,
        scenarios,
        orchestration,
        resources,
        facilityBrain,
        comms,
        timeline,
        advancedMemory,
        specialistAgents,
        debateV2,
        weakSignals,
        policies,
        confidence,
        campaign,
        trust,
        swarm,
        cascade,
        copilot,
        behavior,
        negotiation,
        supremacy,
      ] = await Promise.all([
        getAutonomousLive(),
        getAIRecommendations(),
        getAICouncil(),
        getAIExplanations(),
        getAIMemory(),
        getAIPredictiveForecast(),
        getAIScenarios(),
        getAIOrchestration(),
        getAIResources(),
        getAIFacilityBrain(),
        getAIComms(),
        getAITimeline(),
        getAIAdvancedMemory(),
        getAISpecialistAgents(),
        getAIDebateV2(),
        getAIWeakSignals(),
        getAIPolicies(),
        getAIConfidence(),
        getAICampaign(),
        getAITrust(),
        getAISwarm(),
        getAICascade(),
        getAICopilot(),
        getAIBehavior(),
        getAINegotiation(),
        getAISupremacyScore(),
      ]);
      sharedState = {
        ...sharedState,
        live,
        recommendations,
        council,
        explanations,
        memory,
        forecast,
        scenarios,
        orchestration,
        resources,
        facilityBrain,
        comms,
        timeline,
        advancedMemory,
        specialistAgents,
        debateV2,
        weakSignals,
        policies,
        confidence,
        campaign,
        trust,
        swarm,
        cascade,
        copilot,
        behavior,
        negotiation,
        supremacy,
        loading: false,
        error: null,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: error instanceof Error ? error.message : "Autonomous AI core is reconnecting",
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();
  return refreshInFlight;
}

function startPolling() {
  if (typeof window === "undefined" || pollingInterval !== null) {
    return;
  }
  void refreshSharedAI();
  if (!LIVE_POLLING_ENABLED) {
    return;
  }
  pollingInterval = window.setInterval(() => {
    if (document.visibilityState === "visible") {
      void refreshSharedAI();
    }
  }, DEFAULT_REFRESH_MS);
}

function stopPollingIfUnused() {
  if (typeof window === "undefined" || subscribers.size > 0 || pollingInterval === null) {
    return;
  }
  window.clearInterval(pollingInterval);
  pollingInterval = null;
}

async function withAction(label: string, action: () => Promise<{ live: AutonomousLiveResponse } | AutonomousLiveResponse>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    const result = await action();
    const live = "live" in result ? result.live : result;
    sharedState = {
      ...sharedState,
      live,
      busyAction: null,
      lastAction: label,
      error: null,
    };
    notify();
    await refreshSharedAI();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Autonomous AI action failed",
    };
    notify();
  }
}

export function useAutonomousAI() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    startPolling();
    return () => {
      subscribers.delete(setState);
      stopPollingIfUnused();
    };
  }, []);

  return {
    ...state,
    refresh: refreshSharedAI,
    approve: (recommendationId: string) =>
      withAction(`approve-${recommendationId}`, () => approveAIRecommendation(recommendationId)),
    reject: (recommendationId: string) =>
      withAction(`reject-${recommendationId}`, () => rejectAIRecommendation(recommendationId)),
    overrideMode: (mode: AutonomyMode, reason?: string) =>
      withAction(`override-${mode}`, () => overrideAIPlan({ mode, reason })),
    setResponseMode: (mode: AutonomyMode) =>
      withAction(`response-mode-${mode}`, async () => {
        await setAIResponseAutonomyMode(mode);
        return getAutonomousLive();
      }),
    executePlan: () =>
      withAction("execute-plan", async () => {
        await executeAIPlan();
        return getAutonomousLive();
      }),
    runForecast: (scenario?: AITestScenario) =>
      withAction("run-forecast", async () => {
        await runAIForecast(scenario);
        return getAutonomousLive();
      }),
    compareStrategies: () =>
      withAction("compare-strategies", async () => {
        await compareAIStrategies();
        return getAutonomousLive();
      }),
    runCycle: (scenario?: AITestScenario) =>
      withAction("run-cycle", () => runAICycle(scenario)),
    testScenario: (scenario: AITestScenario) =>
      withAction(`scenario-${scenario}`, () => testAIScenario(scenario)),
    runStrategicLearningCycle: (scenario?: AIStrategicScenario) =>
      withAction("strategic-learning-cycle", async () => {
        await runAIStrategicLearningCycle(scenario);
        return getAutonomousLive();
      }),
    runDebateV2: (scenario?: AIStrategicScenario) =>
      withAction("debate-v2", async () => {
        await runAIDebateV2(scenario);
        return getAutonomousLive();
      }),
    testWeakSignal: (scenario: AIStrategicScenario) =>
      withAction(`weak-signal-${scenario}`, async () => {
        await testAIWeakSignal(scenario);
        return getAutonomousLive();
      }),
    retrainPolicies: () =>
      withAction("retrain-policies", async () => {
        await retrainAIPolicies();
        return getAutonomousLive();
      }),
    simulateCampaign: (scenario?: AIStrategicScenario) =>
      withAction("simulate-campaign", async () => {
        await simulateAICampaign(scenario);
        return getAutonomousLive();
      }),
    executeCopilotIntent: (intent: ExecutiveIntent) =>
      withAction(`copilot-${intent}`, async () => {
        await executeAICopilotIntent(intent);
        return getAutonomousLive();
      }),
    runCinematicDemo: () =>
      withAction("cinematic-demo", async () => {
        const cinematicDemo = await runAICinematicDemo();
        sharedState = { ...sharedState, cinematicDemo };
        return getAutonomousLive();
      }),
    testCascade: (scenario?: AIStrategicScenario) =>
      withAction("test-cascade", async () => {
        await testAICascade(scenario);
        return getAutonomousLive();
      }),
  };
}
