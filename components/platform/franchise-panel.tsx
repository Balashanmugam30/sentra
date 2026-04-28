"use client";

import { formatMoney } from "@/lib/channel/runtime";
import type { ChannelPartnersState } from "@/lib/channel/types";

export function FranchisePanel({ partners }: { partners: ChannelPartnersState }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">Franchise mode</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Local operator distribution</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {partners.franchise_operators.map((operator) => (
          <article className="rounded-3xl border border-white/10 bg-black/25 p-4" key={operator.operator_id}>
            <h3 className="font-semibold text-white">{operator.name}</h3>
            <p className="mt-1 text-sm text-white/45">{operator.city_exclusivity}</p>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-xs text-white/40">Potential ARR</p>
                <p className="font-mono text-xl text-white">{formatMoney(operator.potential_arr)}</p>
              </div>
              <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs text-cyan-100">{operator.onboarding_score}%</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

