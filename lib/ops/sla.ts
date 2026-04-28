import type { OpsTask } from "@/lib/ops/types";

export function getSlaTone(task: Pick<OpsTask, "sla_status">) {
  if (task.sla_status === "breached") {
    return "border-rose-300/25 bg-rose-500/10 text-rose-100";
  }
  if (task.sla_status === "watch") {
    return "border-amber-300/25 bg-amber-400/10 text-amber-100";
  }
  return "border-emerald-300/25 bg-emerald-400/10 text-emerald-100";
}

export function formatRemainingMinutes(minutes: number) {
  return minutes <= 0 ? "breached" : `${minutes}m left`;
}
