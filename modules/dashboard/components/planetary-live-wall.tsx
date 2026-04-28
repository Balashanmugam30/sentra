"use client";

import { useOmega } from "@/lib/omega/use-omega";
import { OmegaBar, OmegaMetricCard, OmegaPanelShell, omegaList, omegaNumber, omegaRecord, omegaString } from "@/modules/dashboard/components/omega-panel-primitives";

export function PlanetaryLiveWall() {
  const { live, planetary } = useOmega();
  const earthTwin = omegaRecord(planetary?.earth_twin);
  const zones = omegaList<Record<string, unknown>>(earthTwin.regional_stress_zones);

  return (
    <OmegaPanelShell
      description="Live planetary wall showing modeled countries, active cities, regional stress zones, and crisis hotspots."
      eyebrow="Planetary Live Wall"
      title={`${live?.metrics?.countries_modeled ?? 195} countries modeled in real time`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <OmegaMetricCard label="Cities active" value={`${live?.metrics?.cities_active ?? 512}+`} />
        <OmegaMetricCard label="Threat events" value={live?.metrics?.threat_events ?? 12} />
        <OmegaMetricCard label="Climate alerts" value={live?.metrics?.climate_alerts ?? 17} />
        <OmegaMetricCard label="Resilience" value={`${live?.metrics?.civilization_resilience ?? 93}%`} />
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {zones.map((zone, index) => (
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4" key={`${omegaString(zone.region, "region")}-${index}`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">{omegaString(zone.region, "Region")}</p>
              <span className="text-xs text-cyan-100">{omegaNumber(zone.stress, 70)} stress</span>
            </div>
            <div className="mt-4">
              <OmegaBar label="Regional pressure" value={omegaNumber(zone.stress, 70)} />
            </div>
          </div>
        ))}
      </div>
    </OmegaPanelShell>
  );
}

