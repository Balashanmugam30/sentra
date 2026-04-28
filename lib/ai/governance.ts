import type { CouncilGovernance, CouncilGovernanceMode, CouncilTimelineEvent } from "@/lib/ai/types";

export const councilGovernanceModes: CouncilGovernanceMode[] = [
  "advisory",
  "approval_required",
  "semi_auto",
  "full_auto",
];

export function buildDefaultGovernance(status = "monitoring"): CouncilGovernance {
  return {
    mode: "approval_required",
    status,
    available_modes: councilGovernanceModes,
    override_options: ["approve", "reject", "modify", "pause_agents"],
  };
}

export function buildCouncilTimeline(): CouncilTimelineEvent[] {
  const now = new Date().toISOString();
  return [
    {
      timestamp: now,
      event: "Council activated",
      detail: "Specialist agents loaded incident context.",
      severity: "low",
    },
    {
      timestamp: now,
      event: "Debate completed",
      detail: "Three negotiation rounds produced unified strategy.",
      severity: "medium",
    },
    {
      timestamp: now,
      event: "Plan awaiting approval",
      detail: "Governance mode requires human command approval.",
      severity: "medium",
    },
  ];
}
