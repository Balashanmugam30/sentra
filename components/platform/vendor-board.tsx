"use client";

import { marketplaceTone } from "@/lib/marketplace/runtime";
import type { MarketplaceVendorsState } from "@/lib/marketplace/types";

export function VendorBoard({ vendors, onApply, busyAction }: { vendors: MarketplaceVendorsState; onApply: () => void; busyAction: string | null }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">Vendor Ecosystem</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Verified marketplace vendors</h3>
        </div>
        <button className="rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60" disabled={busyAction !== null} onClick={onApply} type="button">Apply vendor</button>
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {vendors.vendors.map((vendor) => (
          <article className="rounded-2xl border border-white/10 bg-black/20 p-4" key={vendor.vendor_id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{vendor.name}</p>
                <p className="mt-1 text-xs text-white/45">{vendor.category} / SLA {vendor.response_sla_hours}h</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs ${marketplaceTone(vendor.trust_score)}`}>{vendor.trust_score}</span>
            </div>
            <p className="mt-3 text-xs text-white/55">{vendor.certification_badge}</p>
            <p className="mt-3 font-mono text-sm text-emerald-100">${vendor.revenue_generated.toLocaleString()} generated</p>
          </article>
        ))}
      </div>
    </section>
  );
}

