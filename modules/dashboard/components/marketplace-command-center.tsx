"use client";

import { useMarketplace } from "@/lib/marketplace/use-marketplace";

const money = new Intl.NumberFormat("en-US", { currency: "USD", maximumFractionDigits: 0, style: "currency" });

export function MarketplaceCommandCenter() {
  const { installed, loading, metrics, recommendations, refresh } = useMarketplace();
  const topRecommendation = recommendations?.recommendations?.[0];

  return (
    <section className="rounded-[32px] border border-cyan-100/12 bg-[linear-gradient(135deg,rgba(4,10,24,0.94),rgba(34,211,238,0.08),rgba(245,158,11,0.06))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/58">
            Integration Marketplace
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.055em] text-white">
            {metrics?.active_integrations ?? installed?.active_integrations ?? 0} active integrations driving{" "}
            {money.format(metrics?.addon_arr ?? 0)} addon ARR
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58">
            Tenant-scoped app installs, verified partners, API keys, webhooks, and embedded widgets turn Sentra into a platform ecosystem.
          </p>
        </div>
        <button
          className="rounded-full border border-cyan-200/22 bg-cyan-200/10 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-200/16"
          onClick={() => void refresh()}
          type="button"
        >
          {loading ? "Syncing ecosystem..." : "Refresh"}
        </button>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {[
          ["Marketplace MRR", money.format(metrics?.marketplace_mrr ?? 0), "recurring"],
          ["Apps / Tenant", `${metrics?.avg_apps_per_tenant ?? 0}`, "density"],
          ["Trial to Paid", `${metrics?.trial_to_paid_rate ?? 0}%`, "conversion"],
          ["AI Pick", topRecommendation?.title ?? "SSO hardening", topRecommendation?.priority ?? "high"],
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

