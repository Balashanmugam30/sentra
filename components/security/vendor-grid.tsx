"use client";

import { trustTone } from "@/lib/securitytrust/runtime";
import type { VendorRisk } from "@/lib/securitytrust/types";

export function VendorGrid({ vendors }: { vendors: VendorRisk[] }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-100/70">Vendor Risk Portal</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Third-party integrations and trust tiers</h2>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {vendors.map((vendor) => (
          <article className="rounded-3xl border border-white/10 bg-black/20 p-5" key={vendor.vendor_id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">{vendor.name}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/40">{vendor.trust_tier} / {vendor.access_scope}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 font-mono text-xs ${trustTone(100 - vendor.risk_score)}`}>Risk {vendor.risk_score}</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Metric label="Token" value={`${vendor.token_health}%`} />
              <Metric label="Outages" value={`${vendor.outages}`} />
              <Metric label="Review" value={vendor.next_review} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {[...vendor.permissions, ...vendor.data_classes].map((item) => (
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/55" key={item}>{item}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">{label}</p>
      <p className="mt-1 truncate font-mono text-sm text-white">{value}</p>
    </div>
  );
}
