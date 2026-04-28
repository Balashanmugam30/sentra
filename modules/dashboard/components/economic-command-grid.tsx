"use client";

import { useWorld } from "@/lib/world/use-world";
import {
  WorldMetricTile,
  WorldPanelChrome,
  WorldPill,
  worldCurrency,
  worldList,
  worldNumber,
  worldString,
} from "@/modules/dashboard/components/world-panel-primitives";

export function EconomicCommandGrid() {
  const { economy, live } = useWorld();
  const hotspots = worldList<Record<string, unknown>>(economy?.hotspots);

  return (
    <WorldPanelChrome title="Economic Command Grid" eyebrow="Macro Pressure + Recovery Confidence" accent="gold">
      <div className="grid gap-3 md:grid-cols-4">
        <WorldMetricTile label="GDP Pressure" value={worldNumber(economy?.global_gdp_pressure, 42)} suffix="%" />
        <WorldMetricTile label="Energy Risk" value={worldNumber(economy?.oil_energy_risk, 36)} suffix="%" />
        <WorldMetricTile label="Market Confidence" value={worldNumber(economy?.market_confidence, 78)} suffix="%" tone="gold" />
        <WorldMetricTile label="Pressure" value={worldString(live?.metrics?.economic_pressure, "moderate")} />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {hotspots.slice(0, 3).map((hotspot, index) => (
          <article key={`${worldString(hotspot.market, "market")}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-semibold text-white">{worldString(hotspot.market, "Market")}</h4>
              <WorldPill>Risk {worldNumber(hotspot.risk, 20)}</WorldPill>
            </div>
            <p className="mt-3 text-2xl font-semibold text-amber-100">{worldCurrency(hotspot.arr_opportunity)}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">ARR opportunity</p>
          </article>
        ))}
      </div>
    </WorldPanelChrome>
  );
}

