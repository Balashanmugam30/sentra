"use client";

import { marketplaceTone } from "@/lib/marketplace/runtime";
import type { MarketplacePartnersState } from "@/lib/marketplace/types";

export function PartnerGrid({ partners }: { partners: MarketplacePartnersState }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">Partner Network</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">Implementation and co-sell partners</h3>
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {partners.partners.map((partner) => (
          <article className="rounded-2xl border border-white/10 bg-black/20 p-4" key={partner.partner_id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{partner.name}</p>
                <p className="mt-1 text-xs text-white/45">{partner.type} / {partner.region}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs ${marketplaceTone(partner.partner_score)}`}>{partner.partner_score}</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Metric label="Pipeline" value={`$${partner.co_sell_pipeline.toLocaleString()}`} />
              <Metric label="Consultants" value={`${partner.certified_consultants}`} />
              <Metric label="SLA" value={`${partner.response_sla_hours}h`} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-white/40">{label}</p>
      <p className="mt-1 font-mono text-sm text-white">{value}</p>
    </div>
  );
}

