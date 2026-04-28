"use client";

import { trustTone } from "@/lib/securitytrust/runtime";
import type { PrivacyField, PrivacyState } from "@/lib/securitytrust/types";

export function PrivacyMap({ privacy }: { privacy: PrivacyState }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100/70">Privacy Control Center</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Data classification map</h2>
        </div>
        <span className={`rounded-full border px-3 py-1 font-mono text-xs ${trustTone(100 - privacy.pii_exposure_score)}`}>PII exposure {privacy.pii_exposure_score}</span>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {privacy.fields.map((field) => (
          <FieldCard field={field} key={field.field_id} />
        ))}
      </div>
    </section>
  );
}

function FieldCard({ field }: { field: PrivacyField }) {
  const color =
    field.classification === "Sensitive"
      ? "border-red-200/20 bg-red-400/10"
      : field.classification === "PII"
        ? "border-amber-200/20 bg-amber-300/10"
        : "border-cyan-200/15 bg-cyan-300/10";
  return (
    <article className={`rounded-3xl border p-4 ${color}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-mono text-sm font-semibold text-white">{field.name}</h3>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">{field.classification} / {field.purpose}</p>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-white/70">{field.exposure}</span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Metric label="Masked" value={field.masked ? "Yes" : "No"} />
        <Metric label="Encrypted" value={field.encrypted ? "Yes" : "No"} />
        <Metric label="Retention" value={`${field.retention_days}d`} />
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
