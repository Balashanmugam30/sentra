import type { MasterAction, MasterExecution } from "@/lib/master/types";
import { statusTone } from "@/lib/master/runtime";

type ActionQueueProps = {
  actions: MasterAction[];
  executions: MasterExecution[];
  busyAction: string | null;
  onRun: (actionId?: string) => void;
  onApprove: (actionId?: string) => void;
  onRollback: (actionId?: string) => void;
};

export function ActionQueue({ actions, executions, busyAction, onRun, onApprove, onRollback }: ActionQueueProps) {
  const executionByAction = new Map(executions.map((execution) => [execution.action_id, execution]));

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Autonomous Execution Grid</p>
          <h2 className="mt-2 text-2xl font-black text-white">Action Queue</h2>
        </div>
        <button
          type="button"
          onClick={() => onRun(actions[0]?.action_id)}
          className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={busyAction === "run-autonomy"}
        >
          {busyAction === "run-autonomy" ? "Executing..." : "Run grid"}
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {actions.map((action) => {
          const execution = executionByAction.get(action.action_id);
          return (
            <article key={action.action_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${statusTone(action.priority)}`}>{action.priority}</span>
                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-200">{action.type}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-black text-white">{action.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {action.owner} · ETA {action.eta_minutes}m · Guardrail {action.guardrail.replaceAll("_", " ")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-white">{action.confidence}%</p>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">confidence</p>
                </div>
              </div>
              {execution ? (
                <div className="mt-4">
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-cyan-300 shadow-[0_0_24px_rgba(103,232,249,0.5)]" style={{ width: `${execution.progress}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">{execution.last_step}</p>
                </div>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => onRun(action.action_id)} className="rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-xs font-bold text-cyan-50 transition hover:bg-cyan-300/20">
                  Execute
                </button>
                <button type="button" onClick={() => onApprove(action.action_id)} className="rounded-xl border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-xs font-bold text-emerald-50 transition hover:bg-emerald-300/20">
                  Approve
                </button>
                <button type="button" onClick={() => onRollback(action.action_id)} className="rounded-xl border border-rose-300/25 bg-rose-300/10 px-3 py-2 text-xs font-bold text-rose-50 transition hover:bg-rose-300/20">
                  Rollback
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

