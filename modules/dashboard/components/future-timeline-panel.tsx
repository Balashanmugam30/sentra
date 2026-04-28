"use client";

import { useOmega } from "@/lib/omega/use-omega";
import { OmegaMetricCard, OmegaPanelShell, OmegaPill, omegaList, omegaNumber, omegaString } from "@/modules/dashboard/components/omega-panel-primitives";

export function FutureTimelinePanel() {
  const { future, live } = useOmega();
  const horizons = omegaList<Record<string, unknown>>(future?.horizons);

  return (
    <OmegaPanelShell
      description="Future forecast engine across 24h, 7d, 30d, 1y, and 10y horizons."
      eyebrow="Future Timeline"
      title={`${live?.metrics?.forecast_accuracy ?? omegaNumber(future?.forecast_accuracy, 94)}% forecast accuracy`}
    >
      <div className="grid gap-3 md:grid-cols-3">
        <OmegaMetricCard label="24h to 10y" value="5 horizons" />
        <OmegaMetricCard label="Forecast accuracy" value={`${omegaNumber(future?.forecast_accuracy, 94)}%`} />
        <OmegaMetricCard label="Objective" value={live?.metrics?.current_objective ?? "maximize safety"} />
      </div>
      <div className="mt-5 space-y-3">
        {horizons.map((horizon, index) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={`${omegaString(horizon.horizon, "horizon")}-${index}`}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-white">{omegaString(horizon.horizon, "Horizon")}</p>
              <OmegaPill>{omegaNumber(horizon.confidence, 90)}% confidence</OmegaPill>
            </div>
            <p className="mt-2 text-xs leading-5 text-white/52">{omegaString(horizon.risk, "risk modeled")} / {omegaString(horizon.best_action, "best action active")}</p>
          </div>
        ))}
      </div>
    </OmegaPanelShell>
  );
}

