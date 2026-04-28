"use client";

import type { OpsApproval, OpsExecutionSnapshot } from "@/lib/ops/types";

type GovernancePanelProps = {
  governance: OpsExecutionSnapshot["governance"];
  approvals: OpsApproval[];
  busyAction: string | null;
  onApproveTask: (taskId: string) => void;
};

export function GovernancePanel({ governance, approvals, busyAction, onApproveTask }: GovernancePanelProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-violet-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-violet-100/70">Human Approval Center</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Governed autonomy</h2>
      <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-4">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Mode</p>
        <p className="mt-2 text-2xl font-black text-white">{governance.mode.replaceAll("_", " ")}</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {governance.available_modes.map((mode) => (
          <span key={mode} className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-center text-xs uppercase tracking-[0.18em] text-slate-300">
            {mode.replaceAll("_", " ")}
          </span>
        ))}
      </div>
      <div className="mt-5 grid gap-3">
        {approvals.map((approval) => (
          <article key={approval.approval_id} className="rounded-3xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{approval.title}</h3>
                <p className="mt-1 text-sm text-cyan-50/75">{approval.recommendation}</p>
              </div>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-sm text-white">
                Risk {approval.risk_score}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onApproveTask(approval.task_id)}
              disabled={busyAction === approval.task_id}
              className="mt-4 rounded-2xl bg-emerald-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:opacity-60"
            >
              {busyAction === approval.task_id ? "Approving..." : "Approve Workflow Task"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
