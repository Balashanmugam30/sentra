import type { LearningFutureBranch } from "@/lib/ai/types";

type FutureBranchesProps = {
  branches: LearningFutureBranch[];
};

export function FutureBranches({ branches }: FutureBranchesProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">Future Path Forecaster</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Likely crisis branches</h2>
      <div className="mt-5 space-y-4">
        {branches.map((branch, index) => (
          <article key={`${branch.window}-${branch.branch}`} className="relative rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            {index < branches.length - 1 ? <div className="absolute left-7 top-14 h-8 w-px bg-gradient-to-b from-cyan-300/50 to-transparent" /> : null}
            <div className="flex gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-sm font-black text-cyan-100">
                {index + 1}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-white">{branch.window}</h3>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300">{branch.probability}%</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-200">{branch.branch}</p>
                <p className="mt-1 text-xs text-slate-500">{branch.impact}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
