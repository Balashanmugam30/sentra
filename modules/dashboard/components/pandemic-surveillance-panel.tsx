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

export function PandemicSurveillancePanel() {
  const { pandemic, live } = useWorld();
  const outbreaks = worldList<Record<string, unknown>>(pandemic?.regional_outbreaks);

  return (
    <WorldPanelChrome title="Pandemic Surveillance Panel" eyebrow="Health Continuity + Spread Velocity">
      <div className="grid gap-3 md:grid-cols-4">
        <WorldMetricTile label="Watch Zones" value={worldNumber(live?.metrics?.pandemic_watch_zones, 3)} tone="gold" />
        <WorldMetricTile label="Containment" value={worldNumber(pandemic?.global_containment_score, 82)} suffix="%" />
        <WorldMetricTile label="Medical Supply" value={worldNumber(pandemic?.medical_supply_readiness, 78)} suffix="%" />
        <WorldMetricTile label="Travel AI" value="Active" />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {outbreaks.slice(0, 3).map((outbreak, index) => {
          const containment = worldNumber(outbreak.containment, 80);
          return (
            <article key={`${worldString(outbreak.region, "outbreak")}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-semibold text-white">{worldString(outbreak.region, "Region")}</h4>
                <WorldPill>Velocity {worldNumber(outbreak.spread_velocity, 20)}</WorldPill>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-cyan-200" style={{ width: worldBar(containment) }} />
              </div>
              <p className="mt-2 text-sm text-slate-300">Hospital pressure {worldNumber(outbreak.hospital_pressure, 40)}%</p>
            </article>
          );
        })}
      </div>
      <p className="text-sm text-cyan-50/80">{worldString(pandemic?.travel_advisory_ai, "Targeted travel advisory active.")}</p>
    </WorldPanelChrome>
  );
}

