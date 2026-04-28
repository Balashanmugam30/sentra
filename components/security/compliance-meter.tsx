"use client";

import type { ComplianceScore } from "@/lib/securitydefense/types";

export function ComplianceMeter({ compliance }: { compliance: ComplianceScore }) {
  return (
    <section className="rounded-[30px] border border-emerald-200/15 bg-emerald-300/[0.055] p-5 backdrop-blur-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100/70">Compliance Confidence</p>
      <h2 className="mt-2 text-5xl font-semibold tracking-[-0.05em] text-white">{compliance.score}%</h2>
      <div className="mt-6 grid gap-3">
        {compliance.drivers.map((driver) => (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4" key={driver.label}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/65">{driver.label}</span>
              <span className="font-mono text-emerald-100">{driver.value}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-emerald-300" style={{ width: `${driver.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
