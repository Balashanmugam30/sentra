"use client";

import { useWorld } from "@/lib/world/use-world";
import {
  WorldActionButton,
  WorldMetricTile,
  WorldPanelChrome,
  WorldPill,
  worldNumber,
  worldString,
} from "@/modules/dashboard/components/world-panel-primitives";

export function WorldCommandCenter() {
  const { live, loading, error, busyAction, refresh, runGlobalSimulation } = useWorld();
  const metrics = live?.metrics;

  return (
    <WorldPanelChrome
      title="World Command Center"
      eyebrow="Global Sentience Engine"
      accent="gold"
      action={
        <div className="flex flex-wrap gap-2">
          <WorldPill tone="gold">{worldString(metrics?.generated_mode, "global sentience").replace("_", " ")}</WorldPill>
          <WorldActionButton
            onClick={() => runGlobalSimulation("civilization continuity stress test")}
            disabled={busyAction?.startsWith("simulation")}
          >
            Run Global Simulation
          </WorldActionButton>
          <WorldActionButton onClick={() => void refresh()} disabled={loading}>
            Refresh
          </WorldActionButton>
        </div>
      }
    >
      <div className="grid gap-3 md:grid-cols-4">
        <WorldMetricTile label="Countries Live" value={worldNumber(metrics?.countries_live, 52)} />
        <WorldMetricTile label="Global Stability" value={worldNumber(metrics?.global_stability, 84)} suffix="%" />
        <WorldMetricTile label="Continuity" value={worldNumber(metrics?.continuity_score, 88)} suffix="%" tone="gold" />
        <WorldMetricTile label="Supremacy" value={worldNumber(metrics?.supremacy_score, 97)} suffix="%" tone="gold" />
      </div>
      <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-lg font-semibold text-white">Planet-scale command posture is dominant</h4>
          <WorldPill tone="red">{worldNumber(metrics?.threats_active, 7)} active threats</WorldPill>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Sentra fuses global crisis signals, economy, climate, health, supply chains, diplomacy, space awareness, and autonomy trust into one civilization command grid.
        </p>
        {error ? <p className="mt-3 text-xs text-amber-200">Global feed delayed. Showing last verified world state.</p> : null}
      </div>
    </WorldPanelChrome>
  );
}

