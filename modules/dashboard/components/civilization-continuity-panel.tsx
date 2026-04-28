"use client";

import { useWorld } from "@/lib/world/use-world";
import {
  WorldMetricTile,
  WorldPanelChrome,
  WorldPill,
  worldBar,
  worldList,
  worldNumber,
  worldString,
} from "@/modules/dashboard/components/world-panel-primitives";

export function CivilizationContinuityPanel() {
  const { continuity, live } = useWorld();
  const inputs = worldList<Record<string, unknown>>(continuity?.inputs);

  return (
    <WorldPanelChrome title="Civilization Continuity Panel" eyebrow="Economy + Conflict + Health + Energy + Climate + Trust" accent="gold">
      <div className="grid gap-3 md:grid-cols-3">
        <WorldMetricTile label="Continuity Score" value={worldNumber(live?.metrics?.continuity_score, 88)} suffix="%" tone="gold" />
        <WorldMetricTile label="Primary Risk" value={worldString(continuity?.primary_risk, "climate logistics")} />
        <WorldMetricTile label="Continuity Label" value={worldString(continuity?.label, "resilient")} />
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {inputs.map((input, index) => {
          const score = worldNumber(input.score, 80);
          return (
            <div key={`${worldString(input.dimension, "dimension")}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold capitalize text-white">{worldString(input.dimension, "Dimension")}</span>
                <WorldPill>{score}%</WorldPill>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-amber-200" style={{ width: worldBar(score) }} />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-sm text-slate-300">{worldString(continuity?.stabilization_path, "Stabilization path active.")}</p>
    </WorldPanelChrome>
  );
}

