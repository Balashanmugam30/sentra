import type { LiveIncident } from "@/lib/engines/incident-intelligence";

export type LiveResource = {
  available: number;
  deployed: number;
  fatigue: number;
  id: string;
  label: string;
  reserve: number;
};

export function computeResources(incidents: LiveIncident[], tick: number): LiveResource[] {
  const critical = incidents.filter((incident) => incident.severity >= 4 && incident.status !== "resolved").length;
  const active = incidents.filter((incident) => incident.status !== "resolved").length;
  const pulse = tick % 4;

  return [
    { available: Math.max(2, 14 - critical * 2), deployed: 6 + critical * 2, fatigue: 22 + active * 4 + pulse, id: "fire", label: "Fire teams", reserve: Math.max(18, 86 - critical * 12) },
    { available: Math.max(3, 11 - active), deployed: 5 + Math.min(5, active), fatigue: 18 + active * 3, id: "medics", label: "Medics", reserve: Math.max(28, 82 - active * 7) },
    { available: Math.max(4, 22 - active * 2), deployed: 10 + active * 2, fatigue: 26 + active * 2, id: "security", label: "Security", reserve: Math.max(32, 88 - active * 5) },
    { available: Math.max(1, 6 - critical), deployed: 2 + critical, fatigue: 14 + critical * 6, id: "drones", label: "Drones", reserve: Math.max(44, 92 - critical * 9) },
    { available: Math.max(2, 8 - critical), deployed: 3 + critical, fatigue: 20 + critical * 5, id: "vehicles", label: "Vehicles", reserve: Math.max(38, 84 - critical * 8) },
    { available: Math.max(1, 5 - critical), deployed: critical, fatigue: 16 + critical * 8, id: "generators", label: "Generators", reserve: Math.max(52, 94 - critical * 10) },
  ];
}
