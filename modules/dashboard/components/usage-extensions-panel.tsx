"use client";

import { useMarketplace } from "@/lib/marketplace/use-marketplace";

const money = new Intl.NumberFormat("en-US", { currency: "USD", maximumFractionDigits: 0, style: "currency" });

export function UsageExtensionsPanel() {
  const { installed } = useMarketplace();
  const installs = installed?.installations ?? [];

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">Usage Extensions</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Addon usage, value, and tenant app density</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {installs.slice(0, 6).map((item, index) => (
          <div className="rounded-[20px] border border-white/10 bg-white/[0.045] p-4" key={`${item.installation_id}-usage-${index}`}>
            <p className="text-sm font-semibold text-white">{item.app_name}</p>
            <p className="mt-2 text-2xl font-semibold text-cyan-50">{item.usage_count.toLocaleString()}</p>
            <p className="mt-1 text-xs text-white/45">{money.format(item.billing_addon_value)} monthly addon</p>
          </div>
        ))}
      </div>
    </section>
  );
}

