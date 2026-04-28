"use client";

import { useMarketplace } from "@/lib/marketplace/use-marketplace";

const money = new Intl.NumberFormat("en-US", { currency: "USD", maximumFractionDigits: 0, style: "currency" });

export function MarketplaceRevenuePanel() {
  const { metrics } = useMarketplace();

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">Marketplace Revenue</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{money.format(metrics?.addon_arr ?? 0)} addon ARR from ecosystem monetization</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {(metrics?.top_paid_apps ?? []).map((app, index) => (
          <div className="rounded-[20px] border border-white/10 bg-white/[0.045] p-4" key={`${app.app_id}-${index}`}>
            <p className="font-semibold text-white">{app.name}</p>
            <p className="mt-2 text-2xl font-semibold text-cyan-50">{money.format(app.mrr)}</p>
            <p className="mt-1 text-xs text-white/45">{app.installs} installs</p>
          </div>
        ))}
      </div>
    </section>
  );
}

