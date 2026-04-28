import type { AICouncilAction, AICouncilPlan } from "@/lib/ai/types";

type WarActionsProps = {
  plan: AICouncilPlan;
  busyAction?: string | null;
  onApprove: () => void;
  onOverride: (actionId?: string) => void;
};

const actionTone: Record<string, string> = {
  execute: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
  queue: "border-cyan-300/25 bg-cyan-400/10 text-cyan-100",
  approve: "border-amber-300/25 bg-amber-400/10 text-amber-100",
};

export function WarActions({ plan, busyAction, onApprove, onOverride }: WarActionsProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">Ranked actions</p>
          <h2 className="mt-2 text-2xl font-black text-white">{plan.winner.label}</h2>
          <p className="mt-2 text-sm text-slate-300">ETA to stability: {plan.eta_to_stability}</p>
        </div>
        <button type="button" onClick={onApprove} disabled={Boolean(busyAction)} className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 px-5 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-300/20 disabled:opacity-60">
          {busyAction === "approve" ? "Approving..." : "Approve plan"}
        </button>
      </div>
      <div className="mt-5 space-y-3">
        {plan.ranked_actions.map((action) => (
          <ActionRow key={action.action_id} action={action} busyAction={busyAction} onOverride={onOverride} />
        ))}
      </div>
    </section>
  );
}

function ActionRow({ action, busyAction, onOverride }: { action: AICouncilAction; busyAction?: string | null; onOverride: (actionId?: string) => void }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-black/20 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-cyan-300/15 text-sm font-black text-cyan-100">{action.rank}</span>
          <div>
            <h3 className="font-semibold text-white">{action.title}</h3>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{action.owner} - {action.system}</p>
          </div>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${actionTone[action.decision] ?? actionTone.queue}`}>{action.decision}</span>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-300">Confidence {action.confidence}% {action.approval_required ? "- approval required" : "- auto executable"}</p>
        <button type="button" onClick={() => onOverride(action.action_id)} disabled={Boolean(busyAction)} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-60">
          Override
        </button>
      </div>
    </article>
  );
}

