"use client";

import { channelTone, formatMoney } from "@/lib/channel/runtime";
import type { ChannelSummary } from "@/lib/channel/types";

export function ExpansionScore({ summary }: { summary: ChannelSummary }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.16),transparent_34%),rgba(255,255,255,0.045)] p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100/60">Strategic channel AI</p>
      <div className="mt-4 grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className={`font-mono text-7xl ${channelTone(summary.channel_score)}`}>{summary.channel_score}</p>
          <p className="mt-2 text-sm text-white/50">Expansion score across readiness, partner coverage, revenue, and legal posture.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Metric label="Partner ARR" value={formatMoney(summary.partner_arr)} />
          <Metric label="White-label ARR" value={formatMoney(summary.white_label_arr)} />
          <Metric label="OEM commits" value={formatMoney(summary.oem_commitment)} />
          <Metric label="Pipeline" value={formatMoney(summary.weighted_pipeline)} />
        </div>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {summary.strategic_ai.map((item) => (
          <p className="rounded-3xl border border-white/10 bg-black/25 p-4 text-sm leading-6 text-white/60" key={item}>{item}</p>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">{label}</p>
      <p className="mt-2 font-mono text-xl text-white">{value}</p>
    </div>
  );
}

