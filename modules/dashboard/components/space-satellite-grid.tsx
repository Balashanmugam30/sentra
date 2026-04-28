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

export function SpaceSatelliteGrid() {
  const { space, live } = useWorld();
  const alerts = worldList<Record<string, unknown>>(space?.orbital_incident_alerts);

  return (
    <WorldPanelChrome title="Space + Satellite Grid" eyebrow="Orbital Awareness + Communications Resilience">
      <div className="grid gap-3 md:grid-cols-4">
        <WorldMetricTile label="Satellite Resilience" value={worldNumber(live?.metrics?.satellite_resilience, 91)} suffix="%" tone="gold" />
        <WorldMetricTile label="GPS Disruption" value={worldNumber(space?.gps_disruption_risk, 24)} suffix="%" />
        <WorldMetricTile label="Congestion" value={worldNumber(space?.satellite_congestion, 43)} suffix="%" />
        <WorldMetricTile label="Coverage" value={worldNumber(space?.weather_satellite_coverage, 94)} suffix="%" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {alerts.map((alert, index) => (
          <article key={`${worldString(alert.orbit, "orbit")}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-semibold text-white">{worldString(alert.orbit, "Orbital band")}</h4>
              <WorldPill>{worldNumber(alert.confidence, 88)}% confidence</WorldPill>
            </div>
            <p className="mt-2 text-sm text-slate-300">Incident risk {worldNumber(alert.risk, 24)}%. Terrestrial failover remains ready.</p>
          </article>
        ))}
      </div>
      <p className="text-sm text-cyan-50/80">{worldString(space?.recommended_response, "Keep terrestrial failover active.")}</p>
    </WorldPanelChrome>
  );
}

