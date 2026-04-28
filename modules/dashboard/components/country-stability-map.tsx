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

export function CountryStabilityMap() {
  const { countries, live } = useWorld();
  const countryList = worldList<Record<string, unknown>>(countries?.countries);

  return (
    <WorldPanelChrome title="Country Stability Map" eyebrow="52-Country Stability Index">
      <div className="grid gap-3 md:grid-cols-3">
        <WorldMetricTile label="Countries Live" value={worldNumber(live?.metrics?.countries_live, 52)} />
        <WorldMetricTile label="Global Stability" value={worldNumber(live?.metrics?.global_stability, 84)} suffix="%" tone="gold" />
        <WorldMetricTile label="Forecast Accuracy" value={worldNumber(live?.metrics?.forecast_accuracy, 93)} suffix="%" />
      </div>
      <div className="grid max-h-[520px] gap-3 overflow-hidden md:grid-cols-2 xl:grid-cols-4">
        {countryList.slice(0, 24).map((country, index) => {
          const stability = worldNumber(country.stability_score, 80);
          return (
            <article key={`${worldString(country.country, "country")}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.05] p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-white">{worldString(country.country, "Country")}</span>
                <WorldPill tone={stability < 68 ? "red" : stability > 85 ? "gold" : "cyan"}>{worldString(country.status, "stable")}</WorldPill>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-cyan-200" style={{ width: worldBar(stability) }} />
              </div>
              <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-slate-400">
                {worldString(country.region, "region")} - cyber {worldNumber(country.cyber_defense, 80)}
              </p>
            </article>
          );
        })}
      </div>
    </WorldPanelChrome>
  );
}

