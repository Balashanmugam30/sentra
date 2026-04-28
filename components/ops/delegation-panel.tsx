"use client";

import { getRecommendedDelegate } from "@/lib/ops/delegation";
import type { OpsDelegationOption, OpsGovernanceApproval } from "@/lib/ops/types";

type DelegationPanelProps = {
  delegations: OpsDelegationOption[];
  approvals: OpsGovernanceApproval[];
  busyAction: string | null;
  onDelegate: (approvalId: string, delegateTo: string) => void;
};

export function DelegationPanel({ delegations, approvals, busyAction, onDelegate }: DelegationPanelProps) {
  const recommended = getRecommendedDelegate(delegations);
  const targetApproval = approvals[0];

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-violet-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-violet-100/70">Delegation Center</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Decision maker coverage</h2>
      <div className="mt-5 grid gap-3">
        {delegations.map((delegation) => (
          <article key={delegation.delegation_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{delegation.from} to {delegation.to}</h3>
                <p className="mt-2 text-sm text-slate-300">{delegation.coverage}</p>
              </div>
              <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-100">
                {delegation.load_delta}
              </span>
            </div>
          </article>
        ))}
      </div>
      {recommended && targetApproval ? (
        <button
          type="button"
          onClick={() => onDelegate(targetApproval.approval_id, recommended.to)}
          disabled={busyAction === targetApproval.approval_id}
          className="mt-4 w-full rounded-2xl border border-violet-300/25 bg-violet-300/10 px-4 py-3 text-sm font-semibold text-violet-50 transition hover:bg-violet-300/20 disabled:opacity-60"
        >
          Delegate top approval to {recommended.to}
        </button>
      ) : null}
    </section>
  );
}
