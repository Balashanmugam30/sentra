"use client";

import type { ChannelSummary } from "@/lib/channel/types";

export function ChannelAlerts({ summary }: { summary: ChannelSummary }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">Expansion alerts</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Strategic weak signals</h2>
      <div className="mt-5 space-y-3">
        {summary.scorecards.map((scorecard) => (
          <article className="rounded-3xl border border-white/10 bg-black/25 p-4" key={scorecard.scorecard_id}>
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-semibold text-white">{scorecard.country}</h3>
              <span className="font-mono text-xl text-emerald-200">{scorecard.expansion_score}</span>
            </div>
            <p className="mt-2 text-sm text-white/55">{scorecard.next_best_action}</p>
            <p className="mt-2 text-xs text-amber-100/70">{scorecard.weak_signal}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

