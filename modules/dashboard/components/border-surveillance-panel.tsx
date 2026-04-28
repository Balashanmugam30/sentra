"use client";

import { useGovernment } from "@/lib/government/use-government";
import {
  GovernmentMetricTile,
  GovernmentPanelChrome,
  GovernmentPill,
  govBar,
  govList,
  govNumber,
} from "@/modules/dashboard/components/government-panel-primitives";

type HeatRoute = { sector: string; heat: number; trend: string };

export function BorderSurveillancePanel() {
  const { borders } = useGovernment();

  return (
    <GovernmentPanelChrome
      description="Border AI tracks illegal crossings, drone intrusions, maritime anomalies, cargo risk, and route heatmaps."
      eyebrow="Border Surveillance AI"
      title={`${govNumber(borders?.border_integrity_score, 86)}% border integrity with ${govNumber(borders?.cargo_risk_score, 28)} cargo risk`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <GovernmentMetricTile label="Crossings" value={govNumber(borders?.illegal_crossings, 7)} />
        <GovernmentMetricTile label="Drone Intrusions" value={govNumber(borders?.drone_intrusions, 3)} />
        <GovernmentMetricTile label="Maritime Anomaly" value={govNumber(borders?.maritime_anomalies, 5)} />
        <GovernmentMetricTile label="Cargo Risk" value={`${govNumber(borders?.cargo_risk_score, 28)}%`} />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {govList<HeatRoute>(borders?.route_heatmaps).map((item) => (
          <div className="rounded-[20px] border border-white/10 bg-white/[0.035] p-4" key={item.sector}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-white">{item.sector}</span>
              <GovernmentPill label={item.trend} tone={item.trend === "rising" ? "red" : "cyan"} />
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-orange-300/75" style={{ width: govBar(item.heat) }} />
            </div>
          </div>
        ))}
      </div>
    </GovernmentPanelChrome>
  );
}
