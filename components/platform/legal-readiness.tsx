"use client";

import type { CountriesState, PricingState } from "@/lib/channel/types";

export function LegalReadiness({ countries, pricing }: { countries: CountriesState; pricing: PricingState }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">Legal readiness</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Procurement blockers</h2>
      <div className="mt-5 space-y-3">
        {pricing.legal_readiness.map((legal) => (
          <div className="rounded-3xl border border-white/10 bg-black/25 p-4" key={legal.legal_id}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">{legal.country}</h3>
                <p className="text-sm text-white/45">{legal.contract_pack} · residency {legal.data_residency}</p>
              </div>
              <span className="font-mono text-xl text-cyan-100">{legal.procurement_ready}%</span>
            </div>
          </div>
        ))}
        {countries.blocked.map((blocked) => (
          <div className="rounded-3xl border border-rose-300/20 bg-rose-300/10 p-4" key={blocked.block_id}>
            <h3 className="font-semibold text-rose-100">{blocked.country}</h3>
            <p className="mt-1 text-sm text-rose-100/65">{blocked.reason} · review {blocked.review_date}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

