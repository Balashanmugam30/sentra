"use client";

import { useIncidentStore } from "@/store/incident-store";

export function useActiveIncident() {
  return useIncidentStore((state) => state.activeIncident);
}
