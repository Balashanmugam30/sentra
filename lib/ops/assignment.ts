import type { OpsTask } from "@/lib/ops/types";

const backupOwners = ["Ops Alpha", "Security Bravo", "Medical Unit 2", "Facilities Lead", "Executive Liaison"];

export function recommendBackupOwner(task: OpsTask) {
  if (task.role === "Medical") {
    return "Medical Unit 2";
  }
  if (task.role === "Facilities") {
    return "Facilities Lead";
  }
  if (task.role === "Executive") {
    return "Executive Liaison";
  }
  return backupOwners.find((owner) => owner !== task.owner) ?? "Ops Alpha";
}
