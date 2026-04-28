import type { OpsBlocker } from "@/lib/ops/types";

type BlockerPanelProps = {
  blockers: OpsBlocker[];
};

export function BlockerPanel({ blockers }: BlockerPanelProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-rose-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-rose-100/70">Blockers / Risks</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Execution friction</h2>
      <div className="mt-5 grid gap-3">
        {blockers.length ? blockers.map((blocker) => (
          <article key={blocker.blocker_id} className="rounded-3xl border border-rose-300/20 bg-rose-400/10 p-4">
            <h3 className="font-semibold text-white">{blocker.title}</h3>
            <p className="mt-2 text-sm text-rose-100/80">{blocker.risk}</p>
            <p className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-slate-200">
              {blocker.recommended_action}
            </p>
          </article>
        )) : (
          <div className="rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
            No active blockers. Workflow execution is clear.
          </div>
        )}
      </div>
    </section>
  );
}
