"use client";

import { useGrowth } from "@/lib/growth/use-growth";

export function GlobalPricingPanel() {
  const { pricing } = useGrowth();
  const rows = pricing.filter((item) => item.plan === "Business").slice(0, 8);

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">International Pricing Engine</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Localized plan economics by country</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {rows.map((price, index) => (
          <div className="rounded-[20px] border border-white/10 bg-white/[0.045] p-4" key={`${price.pricing_id}-${index}`}>
            <p className="font-semibold text-white">{price.country}</p>
            <p className="mt-2 text-2xl font-semibold text-cyan-50">{price.currency} {price.local_monthly.toLocaleString()}</p>
            <p className="mt-1 text-xs text-white/45">Tax {price.tax_percent}% - partner {price.partner_commission_percent}%</p>
          </div>
        ))}
      </div>
    </section>
  );
}

