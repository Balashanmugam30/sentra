import type { OpsAutomationAction } from "@/lib/ops/types";

export function getAutomationTone(action: OpsAutomationAction) {
  if (action.status === "watch") {
    return "border-amber-300/25 bg-amber-400/10 text-amber-100";
  }
  if (action.status === "auto_approved") {
    return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
  }
  return "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";
}

export function isN8nReady(action: OpsAutomationAction) {
  return action.connector.startsWith("n8n:webhook:");
}
