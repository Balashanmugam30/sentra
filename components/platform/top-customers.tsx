"use client";

import type { PlatformUsageState } from "@/lib/platform/types";

export function TopCustomers({ usage }: { usage: PlatformUsageState }) {
  const maxRequests = Math.max(1, ...usage.top_customers.map((customer) => customer.requests));
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">Top Customers</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">Usage-led expansion signal</h3>
      <div className="mt-5 space-y-3">
        {usage.top_customers.map((customer) => (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4" key={customer.name}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-white">{customer.name}</p>
              <p className="font-mono text-sm text-white/60">{customer.requests.toLocaleString()}</p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300" style={{ width: `${(customer.requests / maxRequests) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
        <p className="text-sm font-semibold text-emerald-100">Revenue potential: ${usage.revenue_potential.toLocaleString()}</p>
        <p className="mt-2 text-xs leading-5 text-white/55">{usage.upgrade_suggestions[0]}</p>
      </div>
    </section>
  );
}

