"use client";

import { useIncidentStore } from "@/store/incident-store";

export function useEvacuationState() {
  return useIncidentStore((state) => state.activeIncident?.evacuation ?? null);
}
