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

export function GlobalSupremacyScore() {
  const { supremacy, live } = useWorld();
  const dimensions = worldList<Record<string, unknown>>(supremacy?.dimensions);

  return (
    <WorldPanelChrome title="Global Supremacy Score" eyebrow="Final Prestige Metric" accent="gold">
      <div className="grid gap-3 md:grid-cols-4">
        <WorldMetricTile label="Supremacy" value={worldNumber(live?.metrics?.supremacy_score, 97)} suffix="%" tone="gold" />
        <WorldMetricTile label="Forecast Accuracy" value={worldNumber(live?.metrics?.forecast_accuracy, 93)} suffix="%" />
        <WorldMetricTile label="Continuity" value={worldNumber(live?.metrics?.continuity_score, 88)} suffix="%" />
        <WorldMetricTile label="Label" value={worldString(supremacy?.label, "dominant")} tone="gold" />
      </div>
      <div className="space-y-3">
        {dimensions.map((dimension, index) => {
          const score = worldNumber(dimension.score, 90);
          return (
            <div key={`${worldString(dimension.dimension, "dimension")}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.055] p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-white">{worldString(dimension.dimension, "Dimension")}</span>
                <WorldPill tone={score > 92 ? "gold" : "cyan"}>{score}%</WorldPill>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-200 via-white/80 to-amber-200" style={{ width: worldBar(score) }} />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-sm text-amber-50/85">{worldString(supremacy?.executive_summary, "Sentra is operating at dominant global readiness.")}</p>
    </WorldPanelChrome>
  );
}

