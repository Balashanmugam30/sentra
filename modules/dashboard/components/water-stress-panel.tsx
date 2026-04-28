"use client";

import { useOmega } from "@/lib/omega/use-omega";
import { OmegaBar, OmegaMetricCard, OmegaPanelShell, omegaList, omegaNumber, omegaString } from "@/modules/dashboard/components/omega-panel-primitives";

export function WaterStressPanel() {
  const { water } = useOmega();
  const zones = omegaList<Record<string, unknown>>(water?.stress_zones);

  return (
    <OmegaPanelShell
      description="Water stress, drought pressure, reserve days, contamination risk, and resilience interventions."
      eyebrow="Water Stress"
      title={`${omegaNumber(water?.water_resilience_score, 86)}% water resilience score`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <OmegaMetricCard label="Stress index" value={`${omegaNumber(water?.water_stress_index, 46)}%`} />
        <OmegaMetricCard label="Reserve days" value={omegaNumber(water?.reserve_days, 52)} />
        <OmegaMetricCard label="Drought pressure" value={`${omegaNumber(water?.drought_pressure, 39)}%`} />
        <OmegaMetricCard label="Contamination risk" value={`${omegaNumber(water?.flood_contamination_risk, 18)}%`} />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {zones.map((zone, index) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={`${omegaString(zone.zone, "zone")}-${index}`}>
            <p className="text-sm font-semibold text-white">{omegaString(zone.zone, "Zone")}</p>
            <p className="mt-1 text-xs text-white/50">{omegaString(zone.intervention, "intervention active")}</p>
            <div className="mt-4">
              <OmegaBar label="Stress" value={omegaNumber(zone.stress, 60)} />
            </div>
          </div>
        ))}
      </div>
    </OmegaPanelShell>
  );
}

