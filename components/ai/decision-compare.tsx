import type { DecisionEvolution } from "@/lib/ai/types";

type DecisionCompareProps = {
  evolution: DecisionEvolution;
};

export function DecisionCompare({ evolution }: DecisionCompareProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-amber-300/10 via-slate-950/80 to-cyan-300/10 p-5 shadow-2xl shadow-amber-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-100/70">Decision Evolution</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Then vs now</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-3xl border border-rose-300/20 bg-rose-400/10 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-rose-100/70">Past recommendation</p>
          <p className="mt-2 text-lg font-semibold text-white">{evolution.past_recommendation}</p>
          <p className="mt-2 text-sm text-rose-100/80">Confidence {evolution.confidence_before}%</p>
        </div>
        <div className="rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-emerald-100/70">Improved recommendation</p>
          <p className="mt-2 text-lg font-semibold text-white">{evolution.current_recommendation}</p>
          <p className="mt-2 text-sm text-emerald-100/80">Confidence {evolution.confidence_after}%</p>
        </div>
      </div>
      <p className="mt-4 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4 text-sm leading-6 text-cyan-50/85">
        Benefit: {evolution.benefit}
      </p>
      <div className="mt-4 grid gap-2">
        {evolution.why_changed.map((reason) => (
          <p key={reason} className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-300">
            {reason}
          </p>
        ))}
      </div>
    </section>
  );
}
