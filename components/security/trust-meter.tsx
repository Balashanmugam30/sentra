"use client";

import { trustTone } from "@/lib/securitytrust/runtime";
import type { TrustIndex } from "@/lib/securitytrust/types";

export function TrustMeter({ trust }: { trust: TrustIndex }) {
  return (
    <section className="rounded-[32px] border border-emerald-200/15 bg-emerald-300/[0.055] p-6 shadow-[0_24px_80px_rgba(16,185,129,0.12)] backdrop-blur-2xl">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100/70">Sentra Trust Index</p>
          <h2 className="mt-3 text-6xl font-semibold tracking-[-0.06em] text-white">{trust.score}%</h2>
          <p className="mt-2 text-sm text-emerald-50/60">{trust.band} buyer trust posture</p>
        </div>
        <span className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] ${trustTone(trust.score)}`}>{trust.band}</span>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {trust.drivers.map((driver) => (
          <div className="rounded-3xl border border-white/10 bg-black/20 p-4" key={driver.label}>
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">{driver.label}</p>
            <p className="mt-2 font-mono text-2xl text-white">{driver.value}%</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-emerald-300" style={{ width: `${driver.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
