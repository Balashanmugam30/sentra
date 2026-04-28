"use client";

import { useState } from "react";

import { pruneAuditRetention } from "@/lib/security/audit";
import { RETENTION_POLICIES, retentionHealthScore } from "@/lib/security/retention";

const ACTION_LABELS = {
  retain: "Retain",
  archive: "Archive",
  expire: "Expire links",
  revoke: "Revoke",
};

export function RetentionPanel() {
  const [status, setStatus] = useState("Ready");
  const [busy, setBusy] = useState(false);

  const runPrune = async () => {
    setBusy(true);
    const result = await pruneAuditRetention();
    setStatus(
      `Archived ${result.archived_count}, pruned ${result.pruned_count}, ${result.remaining_records} records remain`,
    );
    setBusy(false);
  };

  return (
    <section className="rounded-[32px] border border-white/10 bg-[rgba(3,8,18,0.78)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/70">
            Retention Governance
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Evidence lifecycle controls</h2>
        </div>
        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100">
          {retentionHealthScore()}%
        </span>
      </div>

      <div className="mt-5 grid gap-3">
        {RETENTION_POLICIES.map((policy) => (
          <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-4" key={policy.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-white">{policy.label}</h3>
                <p className="mt-1 text-xs leading-5 text-white/45">{policy.scope}</p>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white/60">
                {policy.status}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-white/45">{policy.retentionDays} day policy</span>
              <span className="font-semibold text-cyan-100">{ACTION_LABELS[policy.action]}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/25 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-white/60">{status}</p>
        <button
          className="inline-flex h-10 items-center justify-center rounded-2xl bg-cyan-100 px-4 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60"
          disabled={busy}
          onClick={() => void runPrune()}
          type="button"
        >
          {busy ? "Running..." : "Run Retention Check"}
        </button>
      </div>
    </section>
  );
}
