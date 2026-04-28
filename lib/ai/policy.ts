import type { LearningPolicyRecommendation } from "@/lib/ai/types";

export function buildPolicyRecommendations(revision = 4, approvedPolicies: string[] = []): LearningPolicyRecommendation[] {
  return [
    {
      policy_id: "POL-17C-01",
      title: "Evacuate gas-adjacent zones earlier when fluctuations persist",
      current_weight: 72,
      recommended_weight: 81,
      reason: "Gas leak simulations stabilized faster when HVAC isolation began before broad evacuation.",
      status: approvedPolicies.includes("POL-17C-01") ? "approved" : "pending_approval",
      revision,
    },
    {
      policy_id: "POL-17C-02",
      title: "Prefer corridor-first routing for hospital incidents",
      current_weight: 68,
      recommended_weight: 84,
      reason: "Hospital scenarios improved when medical lanes were protected before general movement.",
      status: approvedPolicies.includes("POL-17C-02") ? "approved" : "pending_approval",
      revision,
    },
    {
      policy_id: "POL-17C-03",
      title: "Reduce trust in single-source smoke alarms without camera confirmation",
      current_weight: 76,
      recommended_weight: 66,
      reason: "False alarm memory shows better outcomes when second-signal confirmation is required.",
      status: approvedPolicies.includes("POL-17C-03") ? "approved" : "pending_approval",
      revision,
    },
  ];
}
