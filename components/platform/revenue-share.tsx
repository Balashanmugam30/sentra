"use client";

import type { MarketplaceRevenueState } from "@/lib/marketplace/types";

export function RevenueShare({ revenue, onSimulate, busyAction }: { revenue: MarketplaceRevenueState; onSimulate: () => void; busyAction: string | null }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-gradient-to-br from-emerald-300/10 via-white/[0.045] to-cyan-300/10 p-5 backdrop-blur-2xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">Revenue Share</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Marketplace monetization</h3>
        </div>
        <button className="rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60" disabled={busyAction !== null} onClick={onSimulate} type="button">Simulate revenue</button>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <Metric label="Addon MRR" value={`$${revenue.addon_mrr.toLocaleString()}`} />
        <Metric label="ARR" value={`$${revenue.marketplace_arr.toLocaleString()}`} />
        <Metric label="Take Rate" value={`${revenue.take_rate}%`} />
        <Metric label="Sentra Rev" value={`$${revenue.sentra_revenue.toLocaleString()}`} />
      </div>
      <div className="mt-5 space-y-3">
        {revenue.revenue_share.map((share) => (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4" key={share.share_id}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-white">{share.vendor}</p>
              <p className="font-mono text-sm text-emerald-100">${share.gross_mrr.toLocaleString()} MRR</p>
            </div>
            <p className="mt-2 text-xs text-white/45">{share.take_rate}% take rate / ${share.partner_payout.toLocaleString()} partner payout</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-white/40">{label}</p>
      <p className="mt-2 font-mono text-xl text-white">{value}</p>
    </div>
  );
}

