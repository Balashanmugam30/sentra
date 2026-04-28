"use client";

import { getApprovalTone } from "@/lib/ops/approval";
import type { OpsGovernanceApproval } from "@/lib/ops/types";

type ApprovalQueueProps = {
  approvals: OpsGovernanceApproval[];
  busyAction: string | null;
  onApprove: (approvalId: string) => void;
  onReject: (approvalId: string) => void;
  onEscalate: (approvalId: string) => void;
};

export function ApprovalQueue({ approvals, busyAction, onApprove, onReject, onEscalate }: ApprovalQueueProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">Pending Approvals</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Governed decision queue</h2>
      <div className="mt-5 grid gap-3">
        {approvals.map((approval) => (
          <article key={approval.approval_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">{approval.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{approval.workflow} - {approval.route.rationale}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${getApprovalTone(approval)}`}>
                {approval.risk_level}
              </span>
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-3">
              <span className="rounded-2xl bg-white/[0.05] px-3 py-2 text-xs text-slate-300">Approver {approval.delegated_to ?? approval.assigned_to}</span>
              <span className="rounded-2xl bg-white/[0.05] px-3 py-2 text-xs text-slate-300">SLA {approval.sla_remaining_minutes}m</span>
              <span className="rounded-2xl bg-white/[0.05] px-3 py-2 text-xs text-slate-300">Priority {approval.priority_score}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">{approval.impact}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onApprove(approval.approval_id)}
                disabled={busyAction === approval.approval_id}
                className="rounded-xl bg-emerald-300 px-3 py-2 text-xs font-semibold text-slate-950 disabled:opacity-60"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => onReject(approval.approval_id)}
                disabled={busyAction === approval.approval_id}
                className="rounded-xl border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-xs font-semibold text-rose-100 disabled:opacity-60"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => onEscalate(approval.approval_id)}
                disabled={busyAction === approval.approval_id}
                className="rounded-xl border border-amber-300/30 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-100 disabled:opacity-60"
              >
                Escalate
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
