"use client";

import type { UsePublicSafetyResult } from "@/lib/public-safety/use-public-safety";

function trafficTone(segment: { congestion_score: number; blocked: boolean }) {
  if (segment.blocked) {
    return "border-rose-400/30 bg-rose-500/12";
  }
  if (segment.congestion_score >= 75) {
    return "border-amber-400/30 bg-amber-500/12";
  }
  if (segment.congestion_score >= 45) {
    return "border-sky-400/30 bg-sky-500/12";
  }
  return "border-emerald-400/30 bg-emerald-500/12";
}

type TrafficGridPanelProps = {
  publicSafety: UsePublicSafetyResult;
};

export function TrafficGridPanel({ publicSafety }: TrafficGridPanelProps) {
  const segments = publicSafety.traffic?.segments ?? [];

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.78)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-200/70">
            Traffic Grid Panel
          </p>
          <h2 className="text-lg font-semibold text-white">
            Corridor speed, congestion, closures, and ETA penalties for city-aware routing
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {segments.map((segment, index) => (
            <div
              className={`rounded-[20px] border px-4 py-4 text-white ${trafficTone(segment)}`}
              key={`${segment.segment_id}-${segment.from_zone}-${segment.to_zone}-${index}`}
            >
              <div className="text-[0.68rem] uppercase tracking-[0.16em] text-cyan-100/70">
                {segment.from_zone} to {segment.to_zone}
              </div>
              <div className="mt-2 text-sm font-medium">
                {Math.round(segment.speed_kph)} kph • congestion {segment.congestion_score}
              </div>
              <div className="mt-2 text-xs uppercase tracking-[0.14em] text-white/70">
                {segment.blocked ? "blocked" : "open"} • ETA +{segment.eta_penalty_minutes}m
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
