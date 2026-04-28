"use client";

import { formatMoney } from "@/lib/channel/runtime";
import type { ChannelPartnersState, ChannelRevenueState } from "@/lib/channel/types";

export function GlobalLeaderboard({ partners, revenue }: { partners: ChannelPartnersState; revenue: ChannelRevenueState }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">Global leaderboard</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Regional winners</h2>
      <div className="mt-5 space-y-3">
        {revenue.regional_winners.map((winner) => {
          const partner = partners.partners.find((item) => item.partner_id === winner.partner_id);
          return (
            <div className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-black/25 p-4" key={winner.revenue_id}>
              <div>
                <h3 className="font-semibold text-white">{partner?.name ?? winner.partner_id}</h3>
                <p className="text-sm text-white/45">{winner.country} · {winner.take_rate}% take rate</p>
              </div>
              <span className="font-mono text-lg text-emerald-200">{formatMoney(winner.forecast_arr)}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

