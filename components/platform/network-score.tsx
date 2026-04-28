"use client";

import { marketplaceTone } from "@/lib/marketplace/runtime";
import type { MarketplaceSummary } from "@/lib/marketplace/types";

export function NetworkScore({ summary }: { summary: MarketplaceSummary }) {
  return (
    <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-cyan-300/10 via-white/[0.045] to-emerald-300/10 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/60">Marketplace Network</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">Ecosystem growth engine</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
            Tracks certified apps, active installs, trial conversion, revenue attach, and network effects across tenant-safe marketplace activity.
          </p>
        </div>
        <div className={`rounded-[28px] border px-6 py-5 text-center ${marketplaceTone(summary.network_effect_score)}`}>
          <p className="text-xs uppercase tracking-[0.22em] opacity-70">Network Score</p>
          <p className="mt-2 font-mono text-5xl">{summary.network_effect_score}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-5">
        <Metric label="ARR" value={`$${summary.marketplace_arr.toLocaleString()}`} />
        <Metric label="Installs" value={`${summary.install_count}`} />
        <Metric label="Certified" value={`${summary.certified_count}`} />
        <Metric label="Trial Conv." value={`${summary.trial_conversion_rate}%`} />
        <Metric label="Avg Rating" value={`${summary.average_rating}`} />
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">{label}</p>
      <p className="mt-2 font-mono text-xl text-white">{value}</p>
    </div>
  );
}

