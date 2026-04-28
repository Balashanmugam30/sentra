"use client";

import type { MarketplaceRevenueState } from "@/lib/marketplace/types";

export function TopGrossing({ revenue }: { revenue: MarketplaceRevenueState }) {
  const maxMrr = Math.max(1, ...revenue.top_grossing.map((share) => share.gross_mrr));
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">Top Grossing</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">Highest revenue apps</h3>
      <div className="mt-5 space-y-3">
        {revenue.top_grossing.map((share) => (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4" key={share.share_id}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-sm text-cyan-100/80">{share.app_id}</p>
              <p className="font-mono text-sm text-white">${share.gross_mrr.toLocaleString()}</p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300" style={{ width: `${(share.gross_mrr / maxMrr) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

