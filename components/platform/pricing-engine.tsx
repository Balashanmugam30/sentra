"use client";

import type { PricingState } from "@/lib/channel/types";

export function PricingEngine({ pricing }: { pricing: PricingState }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">Regional pricing</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Pricing fit by country</h2>
      <div className="mt-5 overflow-hidden rounded-3xl border border-white/10">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.16em] text-white/40">
            <tr>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Currency</th>
              <th className="px-4 py-3">Base MRR</th>
              <th className="px-4 py-3">Per site</th>
              <th className="px-4 py-3">Margin</th>
              <th className="px-4 py-3">Fit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {pricing.pricing.map((row) => (
              <tr className="bg-black/20 text-white/65" key={row.pricing_id}>
                <td className="px-4 py-3 text-white">{row.country}</td>
                <td className="px-4 py-3">{row.currency}</td>
                <td className="px-4 py-3 font-mono">{row.base_platform_mrr.toLocaleString()}</td>
                <td className="px-4 py-3 font-mono">{row.per_site_mrr.toLocaleString()}</td>
                <td className="px-4 py-3">{row.partner_margin}%</td>
                <td className="px-4 py-3 text-emerald-200">{row.pricing_fit}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

