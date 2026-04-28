"use client";

import { useCivilizationInfra } from "@/lib/civilization-infra/use-civilization-infra";
import { CivilizationActionButton, CivilizationMetricCard, CivilizationPanelShell, civNumber } from "@/modules/dashboard/components/civilization-panel-primitives";

export function CivilizationCommandCenter() {
  const { busyAction, error, live, loading, refresh, runContinuitySimulation } = useCivilizationInfra();

  return (
    <CivilizationPanelShell
      action={
        <div className="flex flex-wrap gap-2">
          <CivilizationActionButton onClick={() => void refresh()}>{loading ? "Syncing..." : "Refresh"}</CivilizationActionButton>
          <CivilizationActionButton busy={busyAction === "continuity-sim"} onClick={() => void runContinuitySimulation()}>
            {busyAction === "continuity-sim" ? "Simulating..." : "Run Continuity Sim"}
          </CivilizationActionButton>
        </div>
      }
      description="National, city, utility, healthcare, transport, education, food, water, and disaster continuity fused into one civilization backbone."
      eyebrow="Civilization Infrastructure OS"
      title={`${live?.label ?? "ESSENTIAL GLOBAL BACKBONE"} with ${live?.civilization_score ?? 98}/100 civilization score`}
      tone="gold"
    >
      {error ? <div className="mb-4 rounded-[20px] border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-50">Continuity cache active: {error}</div> : null}
      <div className="grid gap-3 md:grid-cols-5">
        <CivilizationMetricCard label="Countries" value={live?.countries_connected ?? 31} />
        <CivilizationMetricCard label="Cities" value={live?.cities_active ?? 148} />
        <CivilizationMetricCard label="Population" value={civNumber.format(live?.population_supported ?? 412_000_000)} />
        <CivilizationMetricCard label="Hospitals" value={civNumber.format(live?.hospitals_connected ?? 2_480)} />
        <CivilizationMetricCard label="Recovery" value={`${live?.recovery_coordination_score ?? 96}%`} />
      </div>
      <p className="mt-4 rounded-[22px] border border-cyan-200/12 bg-cyan-200/8 p-4 text-sm leading-6 text-cyan-50/76">
        {live?.backbone_thesis ?? "Sentra coordinates essential civilization systems into one continuity operating layer."}
      </p>
    </CivilizationPanelShell>
  );
}

