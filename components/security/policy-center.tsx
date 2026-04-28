"use client";

import { formatTrustDate } from "@/lib/securitytrust/runtime";
import type { TrustPolicy } from "@/lib/securitytrust/types";

type PolicyCenterProps = {
  policies: TrustPolicy[];
  busyAction: string | null;
  onDecision: (policyId: string, decision: string) => void;
};

export function PolicyCenter({ policies, busyAction, onDecision }: PolicyCenterProps) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/70">Policy Management</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Approve, revise, or archive trust policies</h2>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {policies.map((policy) => (
          <article className="rounded-3xl border border-white/10 bg-black/20 p-4" key={policy.policy_id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{policy.name}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/40">{policy.category} / {policy.version}</p>
              </div>
              <span className={policy.status === "approved" ? "text-sm text-emerald-100" : "text-sm text-amber-100"}>{policy.status}</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Metric label="Coverage" value={`${policy.coverage}%`} />
              <Metric label="Owner" value={policy.owner} />
              <Metric label="Next" value={formatTrustDate(policy.next_review)} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="rounded-xl border border-emerald-200/20 px-3 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-300/10 disabled:opacity-50" disabled={busyAction !== null} onClick={() => onDecision(policy.policy_id, "approved")} type="button">Approve</button>
              <button className="rounded-xl border border-amber-200/20 px-3 py-2 text-xs font-semibold text-amber-100 transition hover:bg-amber-300/10 disabled:opacity-50" disabled={busyAction !== null} onClick={() => onDecision(policy.policy_id, "revise")} type="button">Revise</button>
              <button className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-white/60 transition hover:bg-white/10 disabled:opacity-50" disabled={busyAction !== null} onClick={() => onDecision(policy.policy_id, "archived")} type="button">Archive</button>
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
      <p className="mt-1 truncate text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
