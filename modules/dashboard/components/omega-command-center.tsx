"use client";

import { useOmega } from "@/lib/omega/use-omega";
import { OmegaActionButton, OmegaMetricCard, OmegaPanelShell, omegaCompact } from "@/modules/dashboard/components/omega-panel-primitives";

export function OmegaCommandCenter() {
  const { busyAction, error, live, loading, refresh, runPlanetaryDemo, runSimulation } = useOmega();
  const metrics = live?.metrics;

  return (
    <OmegaPanelShell
      action={
        <div className="flex flex-wrap gap-2">
          <OmegaActionButton onClick={() => void refresh()}>{loading ? "Syncing..." : "Refresh"}</OmegaActionButton>
          <OmegaActionButton busy={busyAction === "simulation"} onClick={() => void runSimulation()}>
            {busyAction === "simulation" ? "Simulating..." : "Run Simulation"}
          </OmegaActionButton>
          <OmegaActionButton busy={busyAction === "planetary-demo"} onClick={() => void runPlanetaryDemo()}>
            {busyAction === "planetary-demo" ? "Launching..." : "Planetary Demo"}
          </OmegaActionButton>
        </div>
      }
      description="Planetary intelligence, civilization-risk forecasting, and recursive self-improving AI fused into one human-governed command layer."
      eyebrow="Omega OS"
      title={`Global Superintelligence Core ${metrics?.compound_intelligence_score ?? 99}/100`}
      tone="gold"
    >
      {error ? <div className="mb-4 rounded-[20px] border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-50">Omega snapshot active: {error}</div> : null}
      <div className="grid gap-3 md:grid-cols-5">
        <OmegaMetricCard label="Countries" value={metrics?.countries_modeled ?? 195} />
        <OmegaMetricCard label="Cities" value={`${omegaCompact.format(metrics?.cities_active ?? 512)}+`} />
        <OmegaMetricCard label="Stability" value={`${metrics?.global_stability ?? 88}%`} />
        <OmegaMetricCard label="AI accuracy" value={`${metrics?.decision_accuracy ?? 96}%`} />
        <OmegaMetricCard label="Trust" value={`${metrics?.trust_score ?? 91}%`} />
      </div>
      <p className="mt-4 rounded-[24px] border border-cyan-200/12 bg-cyan-200/8 p-4 text-sm leading-6 text-cyan-50/76">
        Sentra now models planetary risk and recursively improves routing, forecasting, governance, and recovery optimization while preserving human control.
      </p>
    </OmegaPanelShell>
  );
}

