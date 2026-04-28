"use client";

import type { UseOsintResult } from "@/lib/osint/use-osint";

type RumorWatchPanelProps = {
  osint: UseOsintResult;
};

export function RumorWatchPanel({ osint }: RumorWatchPanelProps) {
  const rumors = osint.rumors?.items ?? [];

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.78)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-200/70">
            Rumor Watch Panel
          </p>
          <h2 className="text-lg font-semibold text-white">
            Flagged misinformation and public claims needing verified response before they distort behavior
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {rumors.length ? rumors.map((rumor, index) => (
            <div className="rounded-[20px] border border-rose-400/20 bg-rose-500/10 px-4 py-4" key={`${rumor.rumor_id}-${rumor.related_keyword}-${index}`}>
              <div className="text-[0.68rem] uppercase tracking-[0.16em] text-rose-100/80">
                {rumor.confidence} confidence • {rumor.risk_level}
              </div>
              <div className="mt-2 text-sm font-medium text-white">{rumor.claim}</div>
              <div className="mt-2 text-sm text-white/70">{rumor.recommended_response}</div>
            </div>
          )) : (
            <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/70">
              No major rumor signals are currently flagged.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
