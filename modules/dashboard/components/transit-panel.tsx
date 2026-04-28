"use client";

import type { UsePublicSafetyResult } from "@/lib/public-safety/use-public-safety";

type TransitPanelProps = {
  publicSafety: UsePublicSafetyResult;
};

export function TransitPanel({ publicSafety }: TransitPanelProps) {
  const lines = publicSafety.transit?.lines ?? [];

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.78)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-200/70">
            Transit Operations Panel
          </p>
          <h2 className="text-lg font-semibold text-white">
            Bus, metro, and shuttle availability with delays and crowding pressure around affected zones
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {lines.map((line, index) => (
            <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4" key={`${line.line_id}-${line.name}-${index}`}>
              <div className="text-[0.68rem] uppercase tracking-[0.16em] text-cyan-200/60">{line.mode}</div>
              <div className="mt-2 text-sm font-medium text-white">{line.name}</div>
              <div className="mt-2 text-xs uppercase tracking-[0.14em] text-white/70">
                {line.status} • delay {line.delay_minutes}m • crowding {line.crowding_level}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
