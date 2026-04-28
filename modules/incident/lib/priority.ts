import type { IncidentSeverity, SystemStatus } from "@/modules/incident/types/incident";

export function resolveSystemStatusFromSeverity(
  severity?: IncidentSeverity | null,
): SystemStatus {
  if (severity === "critical" || severity === "high") {
    return "emergency";
  }

  if (severity === "medium") {
    return "alert";
  }

  return "monitoring";
}

export function resolvePriorityLevel(severity?: IncidentSeverity | null) {
  if (severity === "critical" || severity === "high") {
    return "high" as const;
  }

  if (severity === "medium") {
    return "medium" as const;
  }

  return "low" as const;
}
