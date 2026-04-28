import type { CouncilPlanStep } from "@/lib/ai/types";

type UnifiedPlanProps = {
  plan: CouncilPlanStep[];
};

export function UnifiedPlan({ plan }: UnifiedPlanProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-100/70">Final Unified Plan</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Merged response sequence</h2>
      <div className="mt-5 space-y-3">
        {plan.map((step) => (
          <article key={step.step} className="flex gap-4 rounded-3xl border border-white/10 bg-black/20 p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-300/15 text-sm font-black text-emerald-100">
              {step.step}
            </span>
            <div>
              <h3 className="font-semibold text-white">{step.title}</h3>
              <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">{step.owner} - {step.eta}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
