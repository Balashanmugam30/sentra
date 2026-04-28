import { buildSpecialistAgents } from "@/lib/ai/agents";
import { buildConflictMatrix, buildUnifiedPlan, resolveConsensus } from "@/lib/ai/consensus";
import { buildDebateRounds } from "@/lib/ai/debate";
import { runLocalDecisionEngine } from "@/lib/ai/decisionEngine";
import { buildCouncilTimeline, buildDefaultGovernance } from "@/lib/ai/governance";
import type { CouncilScenario, MultiAgentCouncilResponse } from "@/lib/ai/types";

export const councilScenarios: CouncilScenario[] = [
  { scenario_id: "hotel_kitchen_fire", label: "Hotel kitchen fire" },
  { scenario_id: "basement_gas_leak", label: "Basement gas leak" },
  { scenario_id: "hospital_icu_fire", label: "Hospital ICU fire" },
  { scenario_id: "mall_stampede_risk", label: "Mall stampede risk" },
  { scenario_id: "cyber_physical_attack", label: "Cyber + physical attack" },
  { scenario_id: "multi_zone_crisis", label: "Multi-zone crisis" },
];

const scenarioAlias: Record<string, string> = {
  hospital_icu_fire: "hospital_oxygen_leak",
  mall_stampede_risk: "mall_crowd_surge",
  cyber_physical_attack: "power_outage_blockage",
  multi_zone_crisis: "hotel_kitchen_fire",
};

export function buildLocalCouncilSnapshot(scenarioId = "hotel_kitchen_fire"): MultiAgentCouncilResponse {
  const decision = runLocalDecisionEngine(scenarioAlias[scenarioId] ?? scenarioId);
  const incident = decision.active_incident;
  const agents = buildSpecialistAgents(incident, decision.scores);
  const debateRounds = buildDebateRounds(incident);
  const conflicts = buildConflictMatrix();
  const consensus = resolveConsensus(agents, conflicts);
  const plan = buildUnifiedPlan(incident.floor, incident.zone);
  const generatedAt = new Date().toISOString();

  return {
    generated_at: generatedAt,
    scenario_id: scenarioId,
    agreement_percent: consensus.alignment_percent,
    final_merged_strategy: consensus.final_merged_strategy,
    disagreements: conflicts.map((conflict) => conflict.conflict),
    minority_concerns: [
      "Medical Agent requests monitored stairwell density before broad movement.",
      "Communications Agent recommends no external broadcast until scope is verified.",
    ],
    fallback_strategy:
      "If stairwell congestion exceeds threshold, switch to shelter-in-place for low-risk zones and deploy additional route marshals.",
    agents: agents.map((agent) => ({
      agent_id: agent.agent_id,
      name: agent.name,
      domain: agent.domain,
      proposed_action: agent.top_actions[0] ?? "Review incident context",
      confidence: agent.confidence,
      urgency: agent.urgency_score,
      rationale: agent.reasoning,
      stance: agent.stance === "concern" ? "concern" : agent.stance === "conditional" ? "conditional" : "support",
    })),
    incident,
    specialist_agents: agents,
    agent_recommendations: agents.map((agent) => ({
      agent_id: agent.agent_id,
      agent: agent.name,
      actions: agent.top_actions,
      confidence: agent.confidence,
    })),
    debate_rounds: debateRounds,
    conflict_matrix: conflicts,
    consensus,
    final_unified_plan: plan,
    governance: buildDefaultGovernance(),
    trust_by_agent: agents.map((agent) => ({
      agent_id: agent.agent_id,
      name: agent.name,
      historical_accuracy: agent.historical_accuracy,
      trust_score: agent.trust_score,
      override_rate: agent.override_rate,
      speed_score: agent.speed_score,
      confidence_drift: agent.confidence_drift,
    })),
    council_timeline: buildCouncilTimeline(),
    human_override_options: ["Approve Plan", "Reject Plan", "Modify Plan", "Pause Agents"],
    executive_summary: `Council reached ${consensus.consensus_score}% consensus for ${incident.label}. Final strategy: ${consensus.final_merged_strategy}`,
  };
}
