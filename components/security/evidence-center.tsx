"use client";

import { formatTrustDate } from "@/lib/securitytrust/runtime";
import type { EvidenceState } from "@/lib/securitytrust/types";

export function EvidenceCenter({ evidence }: { evidence: EvidenceState }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/70">Evidence Export Engine</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Audit-ready trust room artifacts</h2>
        </div>
        <span className="rounded-full border border-emerald-200/20 bg-emerald-300/10 px-3 py-2 text-xs text-emerald-100">
          {evidence.ready_items} ready / {evidence.export_formats.join(", ")}
        </span>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {evidence.evidence.map((item) => (
          <article className="rounded-3xl border border-white/10 bg-black/20 p-4" key={item.evidence_id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{item.name}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/40">{item.type} / {item.status}</p>
              </div>
              <button className="rounded-xl border border-cyan-200/20 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/10" type="button">
                Export
              </button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Metric label="Items" value={`${item.items}`} />
              <Metric label="Generated" value={formatTrustDate(item.last_generated)} />
              <Metric label="Hash" value={item.hash} />
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
      <p className="mt-1 truncate font-mono text-xs text-white">{value}</p>
    </div>
  );
}
