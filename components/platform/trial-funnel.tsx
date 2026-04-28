"use client";

import { marketplaceStatusTone } from "@/lib/marketplace/runtime";
import type { MarketplaceRevenueState } from "@/lib/marketplace/types";

export function TrialFunnel({ revenue }: { revenue: MarketplaceRevenueState }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">Trial Funnel</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">Trials to expansion revenue</h3>
      <div className="mt-5 space-y-3">
        {revenue.trials.map((trial) => (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4" key={trial.trial_id}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-sm text-white">{trial.app_id}</p>
              <span className={`rounded-full border px-3 py-1 text-xs ${marketplaceStatusTone(trial.stage)}`}>{trial.stage}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" style={{ width: `${trial.conversion_probability}%` }} />
            </div>
            <p className="mt-3 text-xs text-white/45">{trial.conversion_probability}% conversion / ${trial.expansion_mrr.toLocaleString()} expansion MRR / {trial.days_left}d left</p>
          </div>
        ))}
      </div>
    </section>
  );
}

