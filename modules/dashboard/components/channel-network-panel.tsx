"use client";

import { useGrowth } from "@/lib/growth/use-growth";

const money = new Intl.NumberFormat("en-US", { currency: "USD", maximumFractionDigits: 0, style: "currency" });

export function ChannelNetworkPanel() {
  const { partners } = useGrowth();

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">Channel Partner Distribution</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Partner-led pipeline and regional coverage</h2>
      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {partners.map((partner, index) => (
          <article className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={`${partner.partner_id}-${index}`}>
            <p className="font-semibold text-white">{partner.name}</p>
            <p className="mt-1 text-xs text-white/45">{partner.partner_type} - {partner.country_coverage.join(", ")}</p>
            <p className="mt-3 text-xl font-semibold text-cyan-50">{money.format(partner.pipeline_influenced)}</p>
            <p className="mt-1 text-xs text-white/45">{partner.win_rate}% win rate - cert {partner.certification_score}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

