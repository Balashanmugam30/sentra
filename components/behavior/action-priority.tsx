import type { RecommendedAction } from "@/lib/behavior/decision";

type ActionPriorityProps = {
  actions: RecommendedAction[];
};

export function ActionPriority({ actions }: ActionPriorityProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Recommended actions</p>
      <div className="mt-5 space-y-3">
        {actions.map((action) => (
          <article key={action.action_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Rank {action.rank} - {action.urgency}</p>
                <p className="mt-1 text-lg font-black text-white">{action.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{action.expected_outcome}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-cyan-100">{action.confidence}%</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{action.owner}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
