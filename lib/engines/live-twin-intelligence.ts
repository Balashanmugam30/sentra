import type { LiveIncident } from "@/lib/engines/incident-intelligence";

export type LiveTwinPulse = {
  crowdFlow: number;
  hazardExpansion: number;
  occupancyPressure: number;
  responderProgress: number;
  routeConfidence: number;
  smokeSpread: number;
};

export function computeTwinPulse(incidents: LiveIncident[], tick: number): LiveTwinPulse {
  const active = incidents.filter((incident) => incident.status !== "resolved");
  const fire = active.find((incident) => incident.category?.includes("fire") || incident.type.includes("fire"));
  const crowd = active.find((incident) => incident.category?.includes("crowd") || incident.location.toLowerCase().includes("atrium"));
  const maxSpread = Math.max(24, ...active.map((incident) => incident.spread_probability));

  return {
    crowdFlow: Math.min(95, 42 + (crowd?.spread_probability ?? active.length * 7) + (tick % 5)),
    hazardExpansion: Math.min(96, maxSpread),
    occupancyPressure: Math.min(94, 38 + active.length * 9 + (crowd?.severity ?? 0) * 6),
    responderProgress: Math.min(96, 54 + tick * 2 + active.filter((incident) => incident.lifecycle_status === "Responding").length * 8),
    routeConfidence: Math.max(74, 96 - active.length * 3 + (tick % 4)),
    smokeSpread: Math.min(96, fire?.spread_probability ?? 18 + active.length * 5),
  };
}
