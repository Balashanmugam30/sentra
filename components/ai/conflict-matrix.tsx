import type { CouncilConflict } from "@/lib/ai/types";

type ConflictMatrixProps = {
  conflicts: CouncilConflict[];
};

export function ConflictMatrix({ conflicts }: ConflictMatrixProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-amber-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-100/70">Conflict Matrix</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Tradeoffs resolved by weighted scoring</h2>
      <div className="mt-5 grid gap-3">
        {conflicts.map((conflict) => (
          <article key={conflict.conflict} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{conflict.conflict}</h3>
                <p className="mt-1 text-xs text-slate-500">{conflict.agents.join(" vs ")}</p>
              </div>
              <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-sm font-bold text-emerald-100">
                {conflict.score}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">{conflict.risk}</p>
            <p className="mt-3 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] p-3 text-sm text-cyan-50/85">
              Resolution: {conflict.resolution}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
