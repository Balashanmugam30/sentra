import type { OpsPriority, ResponderMission, StaffTaskStatus } from "./types";

export const STAFF_TASK_STATUS_LABELS: Record<StaffTaskStatus, string> = {
  accepted: "Accepted",
  completed: "Completed",
  escalated: "Escalated",
  pending: "Pending",
};

export const PRIORITY_LABELS: Record<OpsPriority, string> = {
  critical: "Critical",
  high: "High",
  normal: "Normal",
};

export function priorityWeight(priority: OpsPriority) {
  if (priority === "critical") {
    return 3;
  }
  if (priority === "high") {
    return 2;
  }
  return 1;
}

export function rankResponderMission(mission: ResponderMission) {
  const injuryWeight = priorityWeight(mission.priority) * 100;
  const durationWeight = mission.trappedMinutes * 2;
  const proximityWeight = Math.max(0, 140 - mission.distanceMeters);
  const routeSafetyWeight = mission.routeSafety;

  return injuryWeight + durationWeight + proximityWeight + routeSafetyWeight;
}

export function sortResponderQueue(missions: ResponderMission[]) {
  return [...missions].sort((a, b) => rankResponderMission(b) - rankResponderMission(a));
}
