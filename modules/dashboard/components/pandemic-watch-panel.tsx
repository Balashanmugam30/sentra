"use client";

import { useOmega } from "@/lib/omega/use-omega";
import { OmegaBar, OmegaMetricCard, OmegaPanelShell, omegaList, omegaNumber, omegaString } from "@/modules/dashboard/components/omega-panel-primitives";

export function PandemicWatchPanel() {
  const { live, pandemic } = useOmega();
  const zones = omegaList<Record<string, unknown>>(pandemic?.watch_zones);

  return (
    <OmegaPanelShell
      description="Outbreak probability, spread velocity, hospital load, and vaccine readiness across watch zones."
      eyebrow="Pandemic Watch"
      title={`${live?.metrics?.pandemic_watch_zones ?? omegaNumber(pandemic?.pandemic_watch_zones, 3)} watch zones active`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <OmegaMetricCard label="Outbreak probability" value={`${omegaNumber(pandemic?.outbreak_probability, 19)}%`} />
        <OmegaMetricCard label="Hospital load" value={`${omegaNumber(pandemic?.hospital_load_index, 58)}%`} />
        <OmegaMetricCard label="Spread velocity" value={omegaString(pandemic?.spread_velocity, "contained-watch")} />
        <OmegaMetricCard label="Vaccine readiness" value={`${omegaNumber(pandemic?.vaccine_readiness, 87)}%`} />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {zones.map((zone, index) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={`${omegaString(zone.region, "region")}-${index}`}>
            <p className="text-sm font-semibold text-white">{omegaString(zone.region, "Region")}</p>
            <div className="mt-4 space-y-3">
              <OmegaBar label="Probability" value={omegaNumber(zone.probability, 20)} />
              <OmegaBar label="Hospital load" value={omegaNumber(zone.hospital_load, 58)} />
            </div>
          </div>
        ))}
      </div>
    </OmegaPanelShell>
  );
}

