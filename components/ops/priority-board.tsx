import type { OpsApprovalSla, OpsGovernanceApproval } from "@/lib/ops/types";

type PriorityBoardProps = {
  approvals: OpsGovernanceApproval[];
  timers: OpsApprovalSla[];
};

export function PriorityBoard({ approvals, timers }: PriorityBoardProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-amber-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-100/70">Priority Queue</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Impact-ranked approvals</h2>
      <div className="mt-5 space-y-3">
        {approvals.map((approval) => (
          <article key={approval.approval_id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{approval.title}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{approval.route.decision.replaceAll("_", " ")}</p>
              </div>
              <span className="text-2xl font-black text-amber-100">{approval.priority_score}</span>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-5 grid gap-2">
        {timers.map((timer) => (
          <div key={timer.approval_id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm">
            <span className="text-slate-300">{timer.title}</span>
            <span className={timer.status === "breached" ? "font-bold text-rose-100" : "font-bold text-cyan-100"}>
              {timer.remaining_minutes}m
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
