"use client";

import { usePartners } from "@/lib/partners/use-partners";

const money = new Intl.NumberFormat("en-US", { currency: "USD", maximumFractionDigits: 0, style: "currency" });

export function PartnerRevenuePanel() {
  const { revenue } = usePartners();

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">Partner Revenue</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{money.format(revenue?.partner_revenue_share ?? 0)} partner-sourced revenue share</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {(revenue?.top_countries ?? []).map((country, index) => (
          <div className="rounded-[20px] border border-white/10 bg-white/[0.045] p-4" key={`${country.country}-${index}`}>
            <p className="font-semibold text-white">{country.country}</p>
            <p className="mt-2 text-2xl font-semibold text-cyan-50">{money.format(country.revenue)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

