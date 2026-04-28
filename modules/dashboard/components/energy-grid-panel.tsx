"use client";

import { useOmega } from "@/lib/omega/use-omega";
import { OmegaBar, OmegaMetricCard, OmegaPanelShell, omegaList, omegaNumber, omegaString } from "@/modules/dashboard/components/omega-panel-primitives";

export function EnergyGridPanel() {
  const { energy, live } = useOmega();
  const zones = omegaList<Record<string, unknown>>(energy?.zones);

  return (
    <OmegaPanelShell
      description="Shortages, reserve days, blackout probability, grid resilience, and fuel-route risk."
      eyebrow="Energy Grid"
      title={`${live?.metrics?.energy_stress_zones ?? omegaNumber(energy?.energy_stress_zones, 8)} energy stress zones`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <OmegaMetricCard label="Reserve days" value={omegaNumber(energy?.reserve_days, 41)} />
        <OmegaMetricCard label="Blackout probability" value={`${omegaNumber(energy?.blackout_probability, 14)}%`} />
        <OmegaMetricCard label="Grid resilience" value={`${omegaNumber(energy?.grid_resilience_score, 88)}%`} />
        <OmegaMetricCard label="Fuel risk" value={`${omegaNumber(energy?.fuel_route_risk, 31)}%`} />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {zones.map((zone, index) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={`${omegaString(zone.zone, "zone")}-${index}`}>
            <p className="text-sm font-semibold text-white">{omegaString(zone.zone, "Zone")}</p>
            <p className="mt-1 text-xs text-white/50">{omegaNumber(zone.reserves, 40)} reserve days</p>
            <div className="mt-4">
              <OmegaBar label="Stress" value={omegaNumber(zone.stress, 55)} />
            </div>
          </div>
        ))}
      </div>
    </OmegaPanelShell>
  );
}

