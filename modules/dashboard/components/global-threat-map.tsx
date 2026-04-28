"use client";

import { useGovernment } from "@/lib/government/use-government";
import {
  GovernmentPanelChrome,
  GovernmentPill,
  govList,
} from "@/modules/dashboard/components/government-panel-primitives";

type HeatRoute = { sector: string; heat: number; trend: string };

export function GlobalThreatMap() {
  const { borders, defense } = useGovernment();
  const sectors = govList<HeatRoute>(borders?.route_heatmaps);

  return (
    <GovernmentPanelChrome
      description="Cinematic threat surface showing border heat, air/naval alerts, and infrastructure pressure without heavy map dependencies."
      eyebrow="Global Threat Map"
      title="Live national threat geometry"
    >
      <div className="relative min-h-[280px] overflow-hidden rounded-[30px] border border-cyan-100/12 bg-[radial-gradient(circle_at_20%_25%,rgba(34,211,238,0.22),transparent_24%),radial-gradient(circle_at_72%_55%,rgba(251,146,60,0.18),transparent_22%),linear-gradient(135deg,rgba(3,7,18,0.96),rgba(8,21,48,0.9))] p-5">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:34px_34px] opacity-45" />
        <div className="relative grid gap-3 md:grid-cols-3">
          {sectors.map((sector) => (
            <div className="rounded-[24px] border border-white/10 bg-black/25 p-4 backdrop-blur-xl" key={sector.sector}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-white">{sector.sector}</p>
                <GovernmentPill label={`${sector.heat}`} tone={sector.trend === "rising" ? "red" : "cyan"} />
              </div>
              <p className="mt-2 text-xs text-white/50">Trend: {sector.trend}</p>
            </div>
          ))}
        </div>
        <div className="relative mt-5 flex flex-wrap gap-2">
          {govList<string>(defense?.threat_ranking).map((threat) => (
            <GovernmentPill key={threat} label={threat} tone="gold" />
          ))}
        </div>
      </div>
    </GovernmentPanelChrome>
  );
}
