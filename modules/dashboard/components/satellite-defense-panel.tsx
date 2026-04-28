"use client";

import { useOmega } from "@/lib/omega/use-omega";
import { OmegaBar, OmegaMetricCard, OmegaPanelShell, omegaList, omegaNumber, omegaString } from "@/modules/dashboard/components/omega-panel-primitives";

export function SatelliteDefensePanel() {
  const { satellite } = useOmega();
  const constellations = omegaList<Record<string, unknown>>(satellite?.constellations);

  return (
    <OmegaPanelShell
      description="GPS disruption, satellite congestion, orbital alerts, weather coverage, and crisis communications resilience."
      eyebrow="Satellite Defense"
      title={`${omegaNumber(satellite?.communications_resilience, 89)}% communications resilience`}
    >
      <div className="grid gap-3 md:grid-cols-5">
        <OmegaMetricCard label="GPS risk" value={`${omegaNumber(satellite?.gps_disruption_risk, 22)}%`} />
        <OmegaMetricCard label="Congestion" value={`${omegaNumber(satellite?.satellite_congestion, 48)}%`} />
        <OmegaMetricCard label="Orbital alerts" value={omegaNumber(satellite?.orbital_incident_alerts, 5)} />
        <OmegaMetricCard label="Weather coverage" value={`${omegaNumber(satellite?.weather_coverage, 94)}%`} />
        <OmegaMetricCard label="Comms" value={`${omegaNumber(satellite?.communications_resilience, 89)}%`} />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {constellations.map((constellation, index) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={`${omegaString(constellation.name, "constellation")}-${index}`}>
            <p className="text-sm font-semibold text-white">{omegaString(constellation.name, "Constellation")}</p>
            <div className="mt-4 space-y-3">
              <OmegaBar label="Coverage" value={omegaNumber(constellation.coverage, 90)} />
              <OmegaBar label="Risk inverse" value={100 - omegaNumber(constellation.risk, 20)} />
            </div>
          </div>
        ))}
      </div>
    </OmegaPanelShell>
  );
}

