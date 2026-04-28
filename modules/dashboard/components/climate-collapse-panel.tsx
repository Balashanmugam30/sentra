"use client";

import { useOmega } from "@/lib/omega/use-omega";
import { OmegaBar, OmegaMetricCard, OmegaPanelShell, omegaList, omegaNumber, omegaString } from "@/modules/dashboard/components/omega-panel-primitives";

export function ClimateCollapsePanel() {
  const { climate, live } = useOmega();
  const alerts = omegaList<Record<string, unknown>>(climate?.alerts);

  return (
    <OmegaPanelShell
      description="Flood, drought, cyclone, wildfire, heat stress, and crop failure pressure forecasting."
      eyebrow="Climate Command"
      title={`${live?.metrics?.climate_alerts ?? omegaNumber(climate?.climate_alerts, 17)} active climate alerts`}
      tone="danger"
    >
      <div className="grid gap-3 md:grid-cols-6">
        <OmegaMetricCard label="Heat" value={`${omegaNumber(climate?.heat_stress_index, 61)}%`} />
        <OmegaMetricCard label="Flood" value={`${omegaNumber(climate?.flood_risk, 43)}%`} />
        <OmegaMetricCard label="Drought" value={`${omegaNumber(climate?.drought_risk, 39)}%`} />
        <OmegaMetricCard label="Cyclone" value={`${omegaNumber(climate?.cyclone_risk, 27)}%`} />
        <OmegaMetricCard label="Wildfire" value={`${omegaNumber(climate?.wildfire_risk, 34)}%`} />
        <OmegaMetricCard label="Crop failure" value={`${omegaNumber(climate?.crop_failure_pressure, 29)}%`} />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {alerts.map((alert, index) => (
          <div className="rounded-[22px] border border-red-200/10 bg-red-200/[0.045] p-4" key={`${omegaString(alert.zone, "zone")}-${index}`}>
            <p className="text-sm font-semibold text-white">{omegaString(alert.zone, "Zone")}</p>
            <p className="mt-1 text-xs capitalize text-white/50">{omegaString(alert.risk, "risk")} pressure</p>
            <div className="mt-4">
              <OmegaBar label="Severity" value={omegaNumber(alert.severity, 60)} />
            </div>
          </div>
        ))}
      </div>
    </OmegaPanelShell>
  );
}

