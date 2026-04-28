"use client";

import { usePartners } from "@/lib/partners/use-partners";

const money = new Intl.NumberFormat("en-US", { currency: "USD", maximumFractionDigits: 0, style: "currency" });

export function PartnerCommandCenter() {
  const { live, loading, refresh } = usePartners();

  return (
    <section className="rounded-[32px] border border-cyan-100/12 bg-[linear-gradient(135deg,rgba(4,10,24,0.94),rgba(14,165,233,0.08),rgba(245,158,11,0.06))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/58">Partner Command Center</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.055em] text-white">
            {live?.partner_count ?? 0} partners generated {money.format(live?.revenue_generated ?? 0)}
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/58">Resellers, integrators, technology partners, and government channels are now measurable growth infrastructure.</p>
        </div>
        <button className="rounded-full border border-cyan-200/22 bg-cyan-200/10 px-4 py-2 text-sm font-semibold text-cyan-50" onClick={() => void refresh()} type="button">
          {loading ? "Syncing..." : "Refresh"}
        </button>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {[
          ["Platinum", `${live?.platinum_partners ?? 0}`, "elite tier"],
          ["Pipeline", money.format(live?.referred_pipeline ?? 0), "referred"],
          ["Commission", money.format(live?.commission_due ?? 0), "due"],
          ["Health", `${live?.avg_partner_health ?? 0}`, "avg"],
        ].map(([label, value, note]) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={label}>
            <p className="text-[0.62rem] uppercase tracking-[0.18em] text-white/40">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
            <p className="mt-1 text-xs text-cyan-50/56">{note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

