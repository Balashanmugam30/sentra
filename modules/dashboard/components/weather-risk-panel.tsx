"use client";

import type { UseEnvironmentResult } from "@/lib/environment/use-environment";

function riskTone(score: number) {
  if (score >= 80) {
    return "border-rose-400/30 bg-rose-500/12 text-rose-100";
  }
  if (score >= 60) {
    return "border-amber-400/30 bg-amber-500/12 text-amber-100";
  }
  if (score >= 35) {
    return "border-sky-400/30 bg-sky-500/12 text-sky-100";
  }
  return "border-emerald-400/30 bg-emerald-500/12 text-emerald-100";
}

type WeatherRiskPanelProps = {
  environment: UseEnvironmentResult;
};

export function WeatherRiskPanel({ environment }: WeatherRiskPanelProps) {
  const live = environment.live;
  const operationalImpacts = live?.operational_impacts;

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.78)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-200/70">
            Weather Risk Panel
          </p>
          <h2 className="text-lg font-semibold text-white">
            Storm, flood, heat, fire spread, and visibility hazards tied directly to field operations
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          {[
            ["Storm Risk", live?.hazards?.storm_risk ?? 0],
            ["Flood Risk", live?.hazards?.flood_risk ?? 0],
            ["Heat Risk", live?.hazards?.heat_risk ?? 0],
            ["Fire Spread Risk", live?.hazards?.fire_spread_risk ?? 0],
            ["Visibility Risk", live?.hazards?.visibility_risk ?? 0],
          ].map(([label, value], index) => (
            <div
              className={`rounded-[20px] border px-4 py-4 ${riskTone(Number(value))}`}
              key={`${label}-${index}`}
            >
              <div className="text-[0.68rem] uppercase tracking-[0.16em] opacity-75">{label}</div>
              <div className="mt-2 text-lg font-semibold">{value}</div>
            </div>
          ))}
        </div>

        {operationalImpacts ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4">
              <div className="text-[0.68rem] uppercase tracking-[0.16em] text-cyan-200/60">
                Evacuation Difficulty
              </div>
              <div className="mt-2 text-sm font-medium text-white">
                {operationalImpacts.evacuation_difficulty ?? 0}/100
              </div>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4">
              <div className="text-[0.68rem] uppercase tracking-[0.16em] text-cyan-200/60">
                Responder Speed Penalty
              </div>
              <div className="mt-2 text-sm font-medium text-white">
                {operationalImpacts.responder_speed_penalty ?? 0}% penalty
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
