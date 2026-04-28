import type { LiveIncident } from "@/lib/engines/incident-intelligence";

export type ExecutiveLiveMetrics = {
  continuityScore: number;
  downtimePrevented: number;
  financialExposure: number;
  forecast7d: number[];
  nextRecoveryEta: number;
  readiness: number;
  reputationRisk: number;
  threatScore: number;
  topRisks: string[];
};

export function computeExecutiveMetrics(incidents: LiveIncident[], tick: number): ExecutiveLiveMetrics {
  const active = incidents.filter((incident) => incident.status !== "resolved");
  const critical = active.filter((incident) => incident.severity >= 4);
  const maxSpread = Math.max(0, ...active.map((incident) => incident.spread_probability));
  const threatScore = Math.min(96, 18 + active.length * 5 + critical.length * 13 + Math.round(maxSpread / 8));
  const readiness = Math.max(61, 96 - critical.length * 8 - Math.max(0, active.length - 2) * 3 + (tick % 3));
  const financialExposure = Math.max(180_000, active.reduce((sum, incident) => sum + incident.severity * 220_000 + incident.spread_probability * 4100, 280_000));
  const downtimePrevented = Math.round(1_150_000 + readiness * 18_000 + critical.length * 260_000);
  const reputationRisk = Math.min(92, 14 + critical.length * 18 + active.length * 4);
  const nextRecoveryEta = Math.max(6, Math.round(28 - readiness / 5 + critical.length * 4));
  const forecast7d = Array.from({ length: 7 }, (_, index) =>
    Math.max(8, Math.min(82, threatScore - index * 4 + Math.sin((tick + index) / 2) * 3)),
  );

  return {
    continuityScore: Math.max(64, readiness - critical.length * 3),
    downtimePrevented,
    financialExposure,
    forecast7d,
    nextRecoveryEta,
    readiness,
    reputationRisk,
    threatScore,
    topRisks: active.slice(0, 3).map((incident) => `${incident.location}: ${incident.lifecycle_status}`),
  };
}
