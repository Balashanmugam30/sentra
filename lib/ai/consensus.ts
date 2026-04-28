import type {
  CouncilConflict,
  CouncilConsensus,
  CouncilPlanStep,
  CouncilSpecialistAgent,
} from "@/lib/ai/types";

export function buildConflictMatrix(): CouncilConflict[] {
  return [
    {
      conflict: "Evacuate now vs phased evacuation",
      agents: ["Fire Agent", "Medical Agent"],
      risk: "Full evacuation is fastest but may overload stairwell flow.",
      resolution: "Immediate partial evacuation with protected medical lane.",
      score: 92,
    },
    {
      conflict: "Lockdown vs open exits",
      agents: ["Security Agent", "Logistics Agent"],
      risk: "Perimeter control can slow safe egress if applied too broadly.",
      resolution: "Lock service elevators only; keep east stairwell open.",
      score: 89,
    },
    {
      conflict: "Public alert now vs internal only",
      agents: ["Communications Agent", "Executive Risk Agent"],
      risk: "Premature public message may cause panic outside affected zones.",
      resolution: "Internal floor alert now; public statement on standby.",
      score: 86,
    },
    {
      conflict: "Asset protection vs response speed",
      agents: ["Executive Risk Agent", "Fire Agent"],
      risk: "Continuity actions cannot delay suppression.",
      resolution: "Safety-first dispatch, then continuity brief within 10 minutes.",
      score: 94,
    },
  ];
}

export function resolveConsensus(agents: CouncilSpecialistAgent[], conflicts: CouncilConflict[]): CouncilConsensus {
  const avgConfidence = Math.round(agents.reduce((total, agent) => total + agent.confidence, 0) / agents.length);
  const conflictQuality = Math.round(conflicts.reduce((total, conflict) => total + conflict.score, 0) / conflicts.length);
  const consensusScore = Math.round(avgConfidence * 0.56 + conflictQuality * 0.44);

  return {
    consensus_score: consensusScore,
    alignment_percent: Math.min(98, consensusScore + 3),
    dissenting_agents: agents.filter((agent) => agent.confidence < 88).map((agent) => agent.name),
    final_merged_strategy:
      "Life-safety-first partial evacuation with protected medical lane, controlled perimeter, and staged communications.",
    confidence: avgConfidence,
  };
}

export function buildUnifiedPlan(floor: string, zone: string): CouncilPlanStep[] {
  return [
    { step: 1, title: `Immediate partial evacuation of floor ${floor}`, owner: "Fire Agent", eta: "0-2 min" },
    { step: 2, title: "Open east stairwell and protect medical lane", owner: "Logistics Agent", eta: "1-3 min" },
    { step: 3, title: `Dispatch fire team and medic unit to ${zone}`, owner: "Medical Agent", eta: "2-4 min" },
    { step: 4, title: "Lock service elevators while keeping safe exits open", owner: "Security Agent", eta: "2-5 min" },
    { step: 5, title: "Send floor-specific instructions; keep public statement standby", owner: "Communications Agent", eta: "3-6 min" },
    { step: 6, title: "Start executive continuity and evidence capture", owner: "Executive Risk Agent", eta: "6-10 min" },
  ];
}
