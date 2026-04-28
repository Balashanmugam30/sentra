"use client";

import { useMemo } from "react";

import { resolvePriorityLevel, resolveSystemStatusFromSeverity } from "@/modules/incident/lib/priority";
import { useIncidentStore } from "@/store/incident-store";
import { useUiStore } from "@/store/ui-store";

export function useSystemStatus() {
  const activeIncident = useIncidentStore((state) => state.activeIncident);
  const realtimeConnection = useUiStore((state) => state.realtimeConnection);

  return useMemo(() => {
    const status = resolveSystemStatusFromSeverity(activeIncident?.severity ?? null);
    const priority = resolvePriorityLevel(activeIncident?.severity ?? null);

    return {
      status,
      priority,
      realtimeConnection,
      label:
        status === "emergency"
          ? "Emergency"
          : status === "alert"
            ? "Alert"
            : "Monitoring",
    };
  }, [activeIncident?.severity, realtimeConnection]);
}
