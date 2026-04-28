"use client";

import { useOmega } from "@/lib/omega/use-omega";
import { OmegaBar, OmegaMetricCard, OmegaPanelShell, omegaList, omegaNumber, omegaString } from "@/modules/dashboard/components/omega-panel-primitives";

export function MigrationPressurePanel() {
  const { migration } = useOmega();
  const corridors = omegaList<Record<string, unknown>>(migration?.pressure_corridors);

  return (
    <OmegaPanelShell
      description="Border stress, refugee movement forecasting, urban overload probability, and pressure-corridor drivers."
      eyebrow="Migration Pressure"
      title={`${omegaNumber(migration?.migration_pressure_index, 42)} migration pressure index`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <OmegaMetricCard label="Border stress" value={`${omegaNumber(migration?.border_stress, 39)}%`} />
        <OmegaMetricCard label="Urban overload" value={`${omegaNumber(migration?.urban_overload_probability, 24)}%`} />
        <OmegaMetricCard label="Forecast" value={omegaString(migration?.refugee_movement_forecast, "elevated")} />
        <OmegaMetricCard label="Corridors" value={corridors.length || 3} />
      </div>
      <div className="mt-5 space-y-3">
        {corridors.map((corridor, index) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={`${omegaString(corridor.corridor, "corridor")}-${index}`}>
            <p className="text-sm font-semibold text-white">{omegaString(corridor.corridor, "Corridor")}</p>
            <p className="mt-1 text-xs text-white/50">{omegaString(corridor.driver, "driver modeled")}</p>
            <div className="mt-4">
              <OmegaBar label="Pressure" value={omegaNumber(corridor.pressure, 55)} />
            </div>
          </div>
        ))}
      </div>
    </OmegaPanelShell>
  );
}

