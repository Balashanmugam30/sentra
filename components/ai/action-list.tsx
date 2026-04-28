import type { AIDecisionAction } from "@/lib/ai/types";

export function ActionList({ actions }: { actions: AIDecisionAction[] }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/60">Recommended Actions</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Ordered next moves</h2>
      <div className="mt-5 grid gap-3">
        {actions.map((action) => (
          <article className="rounded-2xl border border-white/10 bg-black/20 p-4" key={`${action.rank}-${action.title}`}>
            <div className="flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-cyan-300/15 text-sm font-bold text-cyan-100">
                {action.rank}
              </span>
              <div>
                <p className="font-semibold text-white">{action.title}</p>
                <p className="mt-1 text-sm leading-6 text-white/50">{action.detail}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/35">{action.owner} - priority {action.priority}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
