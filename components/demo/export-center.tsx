"use client";

import type { DemoExportState } from "@/lib/demo/types";

export function ExportCenter({ exports }: { exports: DemoExportState }) {
  return (
    <section className="rounded-[36px] border border-white/10 bg-white/[0.055] p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/60">Export engine</p>
      <h2 className="mt-3 text-3xl font-semibold text-white">{exports.latest_pack}</h2>
      <p className="mt-3 text-sm text-white/55">{exports.evidence_note}</p>
      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {exports.exports.map((item) => (
          <article className="rounded-3xl border border-white/10 bg-black/25 p-4" key={item.export_id}>
            <h3 className="font-semibold text-white">{item.name}</h3>
            <p className="mt-2 text-sm text-white/45">{item.audience} · {item.pages} pages</p>
            <span className="mt-4 inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100">{item.status} {item.type}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

