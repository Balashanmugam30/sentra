"use client";

import { useWorld } from "@/lib/world/use-world";
import {
  WorldPanelChrome,
  WorldPill,
  worldList,
  worldNumber,
  worldRecord,
  worldString,
} from "@/modules/dashboard/components/world-panel-primitives";

export function LiveEarthDigitalTwin() {
  const { live } = useWorld();
  const twin = live?.earth_twin ?? {};
  const routes = worldList<Record<string, unknown>>(twin.trade_routes);
  const weather = worldList<Record<string, unknown>>(twin.weather_systems);
  const risks = worldList<Record<string, unknown>>(twin.risk_points);

  return (
    <WorldPanelChrome title="Live Earth Digital Twin" eyebrow="Animated Planetary Command View">
      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="relative min-h-[360px] overflow-hidden rounded-[28px] border border-cyan-200/15 bg-[radial-gradient(circle_at_center,rgba(8,47,73,0.65),rgba(2,6,23,0.94)_62%)] p-5">
          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/20 bg-[radial-gradient(circle_at_35%_25%,rgba(125,211,252,0.45),rgba(14,116,144,0.22)_34%,rgba(15,23,42,0.9)_68%)] shadow-[0_0_80px_rgba(34,211,238,0.28)]" />
          <div className="absolute left-[22%] top-[28%] h-3 w-3 rounded-full bg-cyan-200 shadow-[0_0_28px_rgba(103,232,249,0.9)]" />
          <div className="absolute left-[58%] top-[38%] h-3 w-3 rounded-full bg-amber-200 shadow-[0_0_28px_rgba(251,191,36,0.85)]" />
          <div className="absolute left-[46%] top-[62%] h-3 w-3 rounded-full bg-red-300 shadow-[0_0_28px_rgba(248,113,113,0.82)]" />
          <div className="absolute inset-x-10 top-1/2 h-px rotate-6 bg-cyan-200/30" />
          <div className="absolute inset-x-14 top-[58%] h-px -rotate-12 bg-amber-200/25" />
          <div className="absolute bottom-5 left-5 right-5 grid gap-2 md:grid-cols-3">
            {routes.slice(0, 3).map((route, index) => (
              <div key={`${worldString(route.route, "route")}-${index}`} className="rounded-2xl border border-white/10 bg-black/35 p-3 backdrop-blur">
                <p className="text-xs font-semibold text-white">{worldString(route.route, "Trade route")}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-cyan-100/70">
                  {worldString(route.status, "watch")} - {worldNumber(route.throughput, 80)}%
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <WorldPill tone="gold">{worldNumber(twin.countries_active, 52)} countries active</WorldPill>
          {weather.slice(0, 3).map((system, index) => (
            <article key={`${worldString(system.system, "weather")}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
              <h4 className="font-semibold text-white">{worldString(system.system, "Weather system")}</h4>
              <p className="mt-2 text-sm text-slate-300">
                Risk {worldNumber(system.risk, 55)} - trajectory {worldString(system.trajectory, "tracking")}
              </p>
            </article>
          ))}
          {risks.slice(0, 2).map((risk, index) => {
            const record = worldRecord(risk);
            return (
              <div key={`${worldString(record.country, "country")}-${index}`} className="rounded-2xl border border-red-400/20 bg-red-500/10 p-3">
                <p className="text-sm font-semibold text-red-100">{worldString(record.country, "Risk point")}</p>
                <p className="text-xs text-red-100/70">Diplomatic risk {worldNumber(record.diplomatic_risk, 30)}%</p>
              </div>
            );
          })}
        </div>
      </div>
    </WorldPanelChrome>
  );
}

