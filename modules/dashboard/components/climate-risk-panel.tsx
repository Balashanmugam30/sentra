"use client";

import { useWorld } from "@/lib/world/use-world";
import {
  WorldMetricTile,
  WorldPanelChrome,
  WorldPill,
  worldList,
  worldNumber,
  worldString,
} from "@/modules/dashboard/components/world-panel-primitives";

export function ClimateRiskPanel() {
  const { climate, live } = useWorld();
  const floods = worldList<Record<string, unknown>>(climate?.flood_zones);
  const heatwaves = worldList<Record<string, unknown>>(climate?.heatwaves);

  return (
    <WorldPanelChrome title="Climate Risk Panel" eyebrow="Flood, Heat, Storm, Fire, Water, Crop Stress" accent="red">
      <div className="grid gap-3 md:grid-cols-4">
        <WorldMetricTile label="Climate Alerts" value={worldNumber(live?.metrics?.climate_alerts, 5)} tone="red" />
        <WorldMetricTile label="Storm Pressure" value={worldNumber(climate?.storm_pressure, 63)} suffix="%" />
        <WorldMetricTile label="Wildfire Risk" value={worldNumber(climate?.wildfire_risk, 54)} suffix="%" />
        <WorldMetricTile label="Water Stress" value={worldNumber(climate?.water_stress, 49)} suffix="%" tone="gold" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {[...floods, ...heatwaves].slice(0, 4).map((item, index) => (
          <article key={`${worldString(item.zone ?? item.region, "climate")}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-semibold text-white">{worldString(item.zone ?? item.region, "Climate zone")}</h4>
              <WorldPill tone={worldNumber(item.risk, 60) > 68 ? "red" : "gold"}>{worldNumber(item.risk, 60)} risk</WorldPill>
            </div>
            <p className="mt-2 text-sm text-slate-300">
              {item.window ? `Window ${worldString(item.window, "48h")}` : `Temperature delta ${worldNumber(item.temperature_delta_c, 4)}C`}
            </p>
          </article>
        ))}
      </div>
      <p className="text-sm text-cyan-50/80">{worldString(climate?.recommended_response, "Pre-stage disaster reserves.")}</p>
    </WorldPanelChrome>
  );
}

