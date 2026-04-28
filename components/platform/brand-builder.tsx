"use client";

import { formatMoney } from "@/lib/channel/runtime";
import type { WhiteLabelState } from "@/lib/channel/types";

export function BrandBuilder({ whitelabel, busyAction, onCreateBrand }: { whitelabel: WhiteLabelState; busyAction: string | null; onCreateBrand: () => void }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">White-label engine</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Branded editions</h2>
          <p className="mt-2 text-sm text-white/50">{formatMoney(whitelabel.licensing_arr)} licensing ARR across {whitelabel.license_seats.toLocaleString()} licensed seats.</p>
        </div>
        <button className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50" disabled={busyAction === "create-brand"} onClick={onCreateBrand} type="button">
          Create brand
        </button>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {whitelabel.brands.map((brand) => (
          <article className="rounded-3xl border border-white/10 bg-black/25 p-4" key={brand.brand_id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">{brand.name}</h3>
                <p className="mt-1 text-sm text-white/50">{brand.client} · {brand.region}</p>
              </div>
              <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100">{brand.status}</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Metric label="ARR" value={formatMoney(brand.licensing_arr)} />
              <Metric label="Seats" value={brand.license_seats.toLocaleString()} />
              <Metric label="Domain" value={brand.domain_status} />
            </div>
            <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-xs text-white/55">{brand.custom_domain}</p>
            <p className="mt-3 text-xs text-white/45">Theme: {brand.theme} · Languages: {brand.language_packs.join(", ")}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">{label}</p>
      <p className="mt-2 font-mono text-sm text-white">{value}</p>
    </div>
  );
}

