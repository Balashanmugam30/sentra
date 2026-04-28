"use client";

import type { ProcurementReadiness } from "@/lib/securitytrust/types";

export function ProcurementReadiness({ readiness }: { readiness: ProcurementReadiness }) {
  return (
    <section className="rounded-[30px] border border-cyan-200/15 bg-cyan-300/[0.055] p-5 backdrop-blur-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/70">Procurement Readiness</p>
      <h2 className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-white">{readiness.buyer_readiness}%</h2>
      <p className="mt-2 text-sm text-white/55">{readiness.procurement_stage}</p>
      <div className="mt-5 grid gap-3">
        <Check label="Security questionnaire" value={readiness.security_questionnaire_ready} />
        <Check label="Vendor packet" value={readiness.vendor_packet_ready} />
        <Check label="Legal readiness" value={readiness.legal_readiness >= 85} detail={`${readiness.legal_readiness}%`} />
      </div>
    </section>
  );
}

function Check({ label, value, detail }: { label: string; value: boolean; detail?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
      <span className="text-sm text-white/65">{label}</span>
      <span className={value ? "text-sm font-semibold text-emerald-100" : "text-sm font-semibold text-amber-100"}>{detail ?? (value ? "Ready" : "Pending")}</span>
    </div>
  );
}
