import type { OpsGovernanceEscalation } from "@/lib/ops/types";

export function getEscalationTone(escalation: OpsGovernanceEscalation) {
  return escalation.level >= 2
    ? "border-rose-300/30 bg-rose-400/10 text-rose-100"
    : "border-amber-300/25 bg-amber-400/10 text-amber-100";
}
