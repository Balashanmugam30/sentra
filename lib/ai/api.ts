import { apiClient } from "@/lib/core/api-client";
import type {
  AIActionResponse,
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
  AIDecisionDataResponse,
  AIDecisionResponse,
  AIDecisionScenario,
  AICouncilAgent,
  AICouncilDebate,
  AICouncilEnvelope,
  AICouncilLearning,
  AICouncilListEnvelope,
  AICouncilMutationResponse,
  AICouncilPlan,
  AICouncilSummary,
  AILearningDataResponse,
  AILearningResponse,
  CouncilDataResponse,
  MultiAgentCouncilResponse,
} from "@/lib/ai/types";

export function getAutonomousLive() {
  return apiClient.requestData<AutonomousLiveResponse>("/ai/live", {
    priority: "critical",
    cacheTtlMs: 5_000,
  });
}

export function getAIRecommendations() {
  return apiClient.requestData<RecommendationsResponse>("/ai/recommendations", {
    priority: "critical",
    cacheTtlMs: 5_000,
  });
}

export function getAICouncil() {
  return apiClient.requestData<CouncilSnapshot>("/ai/council", {
    priority: "normal",
    cacheTtlMs: 5_000,
  });
}

export function getAIExplanations() {
  return apiClient.requestData<ExplanationsResponse>("/ai/explanations", {
    priority: "normal",
    cacheTtlMs: 8_000,
  });
}

export function getAIMemory() {
  return apiClient.requestData<MemoryResponse>("/ai/memory", {
    priority: "low",
    cacheTtlMs: 12_000,
  });
}

export function getAIPredictiveForecast() {
  return apiClient.requestData<PredictiveForecastResponse>("/ai/predict", {
    priority: "normal",
    cacheTtlMs: 8_000,
  });
}

export function getAIScenarios() {
  return apiClient.requestData<ScenarioBranchesResponse>("/ai/scenarios", {
    priority: "normal",
    cacheTtlMs: 8_000,
  });
}

export function getAIOrchestration() {
  return apiClient.requestData<OrchestrationResponse>("/ai/orchestration", {
    priority: "high",
    cacheTtlMs: 5_000,
  });
}

export function getAIResources() {
  return apiClient.requestData<ResourceRebalancerResponse>("/ai/resources", {
    priority: "normal",
    cacheTtlMs: 8_000,
  });
}

export function getAIFacilityBrain() {
  return apiClient.requestData<FacilityBrainResponse>("/ai/facility-brain", {
    priority: "normal",
    cacheTtlMs: 8_000,
  });
}

export function getAIComms() {
  return apiClient.requestData<CommsBrainResponse>("/ai/comms", {
    priority: "normal",
    cacheTtlMs: 8_000,
  });
}

export function getAITimeline() {
  return apiClient.requestData<StrategyTimelineResponse>("/ai/timeline", {
    priority: "low",
    cacheTtlMs: 12_000,
  });
}

export function getAIAdvancedMemory() {
  return apiClient.requestData<AdvancedMemoryResponse>("/ai/memory-advanced", {
    priority: "low",
    cacheTtlMs: 12_000,
  });
}

export function getAISpecialistAgents() {
  return apiClient.requestData<SpecialistAgentsResponse>("/ai/agents", {
    priority: "normal",
    cacheTtlMs: 10_000,
  });
}

export function getAIDebateV2() {
  return apiClient.requestData<DebateV2Response>("/ai/debate", {
    priority: "normal",
    cacheTtlMs: 10_000,
  });
}

export function getAIWeakSignals() {
  return apiClient.requestData<WeakSignalsResponse>("/ai/weak-signals", {
    priority: "high",
    cacheTtlMs: 6_000,
  });
}

export function getAIPolicies() {
  return apiClient.requestData<PolicyEvolutionResponse>("/ai/policies", {
    priority: "low",
    cacheTtlMs: 12_000,
  });
}

export function getAIConfidence() {
  return apiClient.requestData<ConfidenceDriftResponse>("/ai/confidence", {
    priority: "normal",
    cacheTtlMs: 8_000,
  });
}

export function getAICampaign() {
  return apiClient.requestData<CampaignPlanResponse>("/ai/campaign", {
    priority: "normal",
    cacheTtlMs: 10_000,
  });
}

export function getAITrust() {
  return apiClient.requestData<TrustDashboardResponse>("/ai/trust", {
    priority: "low",
    cacheTtlMs: 12_000,
  });
}

export function getAISwarm() {
  return apiClient.requestData<SwarmResponse>("/ai/swarm", {
    priority: "high",
    cacheTtlMs: 6_000,
  });
}

export function getAICascade() {
  return apiClient.requestData<CascadeResponse>("/ai/cascade", {
    priority: "high",
    cacheTtlMs: 6_000,
  });
}

export function getAICopilot() {
  return apiClient.requestData<CopilotResponse>("/ai/copilot", {
    priority: "normal",
    cacheTtlMs: 8_000,
  });
}

export function getAIBehavior() {
  return apiClient.requestData<BehaviorResponse>("/ai/behavior", {
    priority: "normal",
    cacheTtlMs: 8_000,
  });
}

export function getAINegotiation() {
  return apiClient.requestData<NegotiationResponse>("/ai/negotiation", {
    priority: "normal",
    cacheTtlMs: 10_000,
  });
}

export function getAISupremacyScore() {
  return apiClient.requestData<SupremacyScoreResponse>("/ai/supremacy-score", {
    priority: "critical",
    cacheTtlMs: 5_000,
  });
}

export function approveAIRecommendation(recommendationId: string, note?: string) {
  return apiClient.requestData<AIActionResponse>("/ai/approve", {
    method: "POST",
    body: { recommendation_id: recommendationId, note },
    priority: "critical",
  });
}

export function rejectAIRecommendation(recommendationId: string, note?: string) {
  return apiClient.requestData<AIActionResponse>("/ai/reject", {
    method: "POST",
    body: { recommendation_id: recommendationId, note },
    priority: "critical",
  });
}

export function overrideAIPlan(payload: {
  recommendationId?: string;
  mode?: AutonomyMode;
  modifiedPlan?: string;
  reason?: string;
}) {
  return apiClient.requestData<AIActionResponse>("/ai/override", {
    method: "POST",
    body: {
      recommendation_id: payload.recommendationId,
      mode: payload.mode,
      modified_plan: payload.modifiedPlan,
      reason: payload.reason,
    },
    priority: "critical",
  });
}

export function setAIResponseAutonomyMode(mode: AutonomyMode) {
  return apiClient.requestData<OrchestrationResponse>("/ai/set-autonomy-mode", {
    method: "POST",
    body: { mode },
    priority: "critical",
  });
}

export function getAIDecision() {
  return apiClient.requestData<AIDecisionResponse>("/ai/decision", {
    priority: "critical",
    cacheTtlMs: 5_000,
  });
}

export function runAIDecision(scenarioId?: string) {
  return apiClient.requestData<AIDecisionResponse>("/ai/decision/run", {
    method: "POST",
    body: { scenario_id: scenarioId },
    priority: "critical",
  });
}

export function getAIDecisionScenarios() {
  return apiClient.requestData<AIDecisionDataResponse<{ scenarios: AIDecisionScenario[] }>>("/ai/decision/scenarios", {
    priority: "normal",
    cacheTtlMs: 12_000,
  });
}

export function loadAIDecisionScenario(scenarioId: string) {
  return apiClient.requestData<AIDecisionResponse>("/ai/scenarios/load", {
    method: "POST",
    body: { scenario_id: scenarioId },
    priority: "high",
  });
}

export function getAIDecisionSummary() {
  return apiClient.requestData<AIDecisionDataResponse>("/ai/summary", {
    priority: "normal",
    cacheTtlMs: 6_000,
  });
}

export function getAIDecisionForecast() {
  return apiClient.requestData<AIDecisionDataResponse<{ forecast: AIDecisionResponse["forecast"] }>>("/ai/forecast", {
    priority: "normal",
    cacheTtlMs: 6_000,
  });
}

export function getAIDecisionResources() {
  return apiClient.requestData<AIDecisionDataResponse<{ resources: AIDecisionResponse["resources"] }>>("/ai/decision/resources", {
    priority: "normal",
    cacheTtlMs: 6_000,
  });
}

export function getAIMultiAgentCouncil() {
  return apiClient.requestData<MultiAgentCouncilResponse>("/ai/council", {
    priority: "critical",
    cacheTtlMs: 5_000,
  });
}

export function runAIMultiAgentCouncil(scenarioId?: string) {
  return apiClient.requestData<MultiAgentCouncilResponse>("/ai/council/run", {
    method: "POST",
    body: { scenario_id: scenarioId },
    priority: "critical",
  });
}

export function getAICouncilAgents() {
  return apiClient.requestData<CouncilDataResponse<{ agents: MultiAgentCouncilResponse["specialist_agents"] }>>(
    "/ai/council/agents",
    {
      priority: "normal",
      cacheTtlMs: 8_000,
    },
  );
}

export function getAICouncilDebate() {
  return apiClient.requestData<CouncilDataResponse<{ debate_rounds: MultiAgentCouncilResponse["debate_rounds"] }>>(
    "/ai/council/debate",
    {
      priority: "normal",
      cacheTtlMs: 8_000,
    },
  );
}

export function getAICouncilConsensus() {
  return apiClient.requestData<
    CouncilDataResponse<{
      consensus: MultiAgentCouncilResponse["consensus"];
      final_unified_plan: MultiAgentCouncilResponse["final_unified_plan"];
    }>
  >("/ai/council/consensus", {
    priority: "normal",
    cacheTtlMs: 8_000,
  });
}

export function approveAICouncilPlan(reason?: string) {
  return apiClient.requestData<MultiAgentCouncilResponse>("/ai/council/approve", {
    method: "POST",
    body: { reason },
    priority: "critical",
  });
}

export function rejectAICouncilPlan(reason?: string) {
  return apiClient.requestData<MultiAgentCouncilResponse>("/ai/council/reject", {
    method: "POST",
    body: { reason },
    priority: "critical",
  });
}

export function pauseAICouncilAgents(reason?: string) {
  return apiClient.requestData<MultiAgentCouncilResponse>("/ai/council/pause", {
    method: "POST",
    body: { reason },
    priority: "high",
  });
}

export function getAILearning() {
  return apiClient.requestData<AILearningResponse>("/ai/learning", {
    priority: "critical",
    cacheTtlMs: 5_000,
  });
}

export function runAILearningCycle(scenarioId?: string) {
  return apiClient.requestData<AILearningResponse>("/ai/learning/run", {
    method: "POST",
    body: { scenario_id: scenarioId },
    priority: "critical",
  });
}

export function getAILearningMemory() {
  return apiClient.requestData<AILearningDataResponse<Pick<AILearningResponse, "memory" | "similar_incidents" | "decision_evolution">>>(
    "/ai/learning/memory",
    {
      priority: "normal",
      cacheTtlMs: 8_000,
    },
  );
}

export function getAILearningForecast() {
  return apiClient.requestData<AILearningDataResponse<Pick<AILearningResponse, "weak_signals" | "future_forecast">>>(
    "/ai/learning/forecast",
    {
      priority: "normal",
      cacheTtlMs: 8_000,
    },
  );
}

export function getAILearningTrust() {
  return apiClient.requestData<AILearningDataResponse<Pick<AILearningResponse, "trust_drift" | "learning_score">>>(
    "/ai/learning/trust",
    {
      priority: "normal",
      cacheTtlMs: 8_000,
    },
  );
}

export function getAILearningPolicies() {
  return apiClient.requestData<AILearningDataResponse<Pick<AILearningResponse, "policy_recommendations" | "governance">>>(
    "/ai/learning/policies",
    {
      priority: "normal",
      cacheTtlMs: 8_000,
    },
  );
}

export function simulateAILearning(scenarioId?: string) {
  return apiClient.requestData<AILearningResponse>("/ai/learning/simulate", {
    method: "POST",
    body: { scenario_id: scenarioId },
    priority: "high",
  });
}

export function approveAILearningPolicy(policyId: string) {
  return apiClient.requestData<AILearningResponse>("/ai/learning/approve-policy", {
    method: "POST",
    body: { policy_id: policyId },
    priority: "critical",
  });
}

export function executeAIPlan(planId?: string) {
  return apiClient.requestData<OrchestrationResponse>("/ai/execute-plan", {
    method: "POST",
    body: { plan_id: planId },
    priority: "critical",
  });
}

export function runAIForecast(scenario?: AITestScenario) {
  return apiClient.requestData<PredictiveForecastResponse>("/ai/run-forecast", {
    method: "POST",
    body: { scenario },
    priority: "high",
  });
}

export function compareAIStrategies() {
  return apiClient.requestData<ScenarioBranchesResponse>("/ai/compare-strategies", {
    method: "POST",
    priority: "high",
  });
}

export function runAICycle(scenario?: AITestScenario) {
  return apiClient.requestData<AutonomousLiveResponse>("/ai/run-cycle", {
    method: "POST",
    body: { scenario },
    priority: "high",
  });
}

export function testAIScenario(scenario: AITestScenario) {
  return apiClient.requestData<AutonomousLiveResponse>("/ai/test-scenario", {
    method: "POST",
    body: { scenario },
    priority: "high",
  });
}

export function runAIStrategicLearningCycle(scenario?: AIStrategicScenario) {
  return apiClient.requestData<AdvancedMemoryResponse>("/ai/run-learning-cycle", {
    method: "POST",
    body: { scenario },
    priority: "high",
  });
}

export function runAIDebateV2(scenario?: AIStrategicScenario) {
  return apiClient.requestData<DebateV2Response>("/ai/run-debate", {
    method: "POST",
    body: { scenario },
    priority: "high",
  });
}

export function testAIWeakSignal(scenario: AIStrategicScenario) {
  return apiClient.requestData<WeakSignalsResponse>("/ai/test-weak-signal", {
    method: "POST",
    body: { scenario },
    priority: "high",
  });
}

export function retrainAIPolicies() {
  return apiClient.requestData<PolicyEvolutionResponse>("/ai/retrain-policies", {
    method: "POST",
    priority: "high",
  });
}

export function simulateAICampaign(scenario?: AIStrategicScenario) {
  return apiClient.requestData<CampaignPlanResponse>("/ai/simulate-campaign", {
    method: "POST",
    body: { scenario },
    priority: "high",
  });
}

export function executeAICopilotIntent(intent: ExecutiveIntent) {
  return apiClient.requestData<CopilotResponse>("/ai/copilot/execute", {
    method: "POST",
    body: { intent },
    priority: "critical",
  });
}

export function runAICinematicDemo() {
  return apiClient.requestData<CinematicDemoResponse>("/ai/run-cinematic-demo", {
    method: "POST",
    priority: "high",
  });
}

export function testAICascade(scenario?: AIStrategicScenario) {
  return apiClient.requestData<CascadeResponse>("/ai/test-cascade", {
    method: "POST",
    body: { scenario },
    priority: "high",
  });
}

export function getAICouncilCoreSummary() {
  return apiClient.requestData<AICouncilEnvelope<AICouncilSummary>>("/aicouncil/summary", {
    priority: "critical",
    cacheTtlMs: 6_000,
  });
}

export function getAICouncilCoreAgents() {
  return apiClient.requestData<AICouncilListEnvelope<AICouncilAgent>>("/aicouncil/agents", {
    priority: "normal",
    cacheTtlMs: 8_000,
  });
}

export function runAICouncilCoreDebate(scenario_id?: string, objective?: string) {
  return apiClient.requestData<AICouncilEnvelope<AICouncilDebate>>("/aicouncil/debate", {
    method: "POST",
    body: { scenario_id, objective },
    priority: "critical",
  });
}

export function setAICouncilObjective(objective: string) {
  return apiClient.requestData<AICouncilMutationResponse>("/aicouncil/objective", {
    method: "POST",
    body: { objective },
    priority: "critical",
  });
}

export function getAICouncilPlan() {
  return apiClient.requestData<AICouncilEnvelope<AICouncilPlan>>("/aicouncil/plan", {
    priority: "critical",
    cacheTtlMs: 6_000,
  });
}

export function approveAICouncilCorePlan(plan_id?: string, reason?: string) {
  return apiClient.requestData<AICouncilMutationResponse>("/aicouncil/approve", {
    method: "POST",
    body: { plan_id, reason },
    priority: "critical",
  });
}

export function overrideAICouncilCore(action_id?: string, mode = "manual_override", reason?: string) {
  return apiClient.requestData<AICouncilMutationResponse>("/aicouncil/override", {
    method: "POST",
    body: { action_id, mode, reason },
    priority: "critical",
  });
}

export function getAICouncilLearning() {
  return apiClient.requestData<AICouncilEnvelope<AICouncilLearning>>("/aicouncil/learning", {
    priority: "normal",
    cacheTtlMs: 10_000,
  });
}

export function retrainAICouncilWeights(domain = "strategic weights", reason = "learning drift and override feedback") {
  return apiClient.requestData<AICouncilMutationResponse>("/aicouncil/retrain", {
    method: "POST",
    body: { domain, reason },
    priority: "high",
  });
}
