"use client";

import type { LearningGovernance, LearningPolicyRecommendation } from "@/lib/ai/types";

type PolicyEvolutionProps = {
  policies: LearningPolicyRecommendation[];
  governance: LearningGovernance;
  busyAction: string | null;
  onApprove: (policyId: string) => void;
};

export function PolicyEvolution({ policies, governance, busyAction, onApprove }: PolicyEvolutionProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-violet-950/20 backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-violet-100/70">Policy Evolution</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Human-governed policy updates</h2>
        </div>
        <span className="rounded-full border border-violet-300/25 bg-violet-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-100">
          Rev {governance.policy_revision}
        </span>
      </div>
      <div className="mt-5 grid gap-3">
        {policies.map((policy) => (
          <article key={policy.policy_id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{policy.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{policy.reason}</p>
              </div>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">
                {policy.status.replaceAll("_", " ")}
              </span>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm text-slate-400">{policy.current_weight}</span>
              <div className="h-2 flex-1 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-violet-300 to-cyan-300" style={{ width: `${policy.recommended_weight}%` }} />
              </div>
              <span className="text-sm font-semibold text-cyan-100">{policy.recommended_weight}</span>
            </div>
            <button
              type="button"
              onClick={() => onApprove(policy.policy_id)}
              disabled={policy.status === "approved" || Boolean(busyAction)}
              className="mt-4 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {policy.status === "approved" ? "Approved" : busyAction === policy.policy_id ? "Approving..." : "Approve Policy"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
