import type { ApprovalSnapshot } from "@/lib/behavior/decision";

type ApprovalQueueProps = {
  approval: ApprovalSnapshot;
  busy?: boolean;
  onApprove?: (approvalId: string) => void;
};

export function ApprovalQueue({ approval, busy = false, onApprove }: ApprovalQueueProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Human approval queue</p>
          <h2 className="mt-2 text-2xl font-black text-white">{approval.total_pending} pending decisions</h2>
        </div>
        <p className="text-sm text-slate-400">{approval.governance_mode}</p>
      </div>
      <div className="mt-5 space-y-3">
        {approval.pending.map((item) => (
          <article key={item.approval_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-black text-white">{item.action}</p>
                <p className="mt-1 text-xs text-slate-400">{item.approver} - SLA {item.sla_minutes} min - {item.risk}</p>
              </div>
              {onApprove ? (
                <button type="button" onClick={() => onApprove(item.approval_id)} disabled={busy} className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-300/20 disabled:opacity-60">
                  {busy ? "Approving..." : "Approve"}
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
