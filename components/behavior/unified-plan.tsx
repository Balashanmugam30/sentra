import type { CouncilSnapshot } from "@/lib/behavior/learning";

type UnifiedPlanProps = {
  council: CouncilSnapshot;
};

export function UnifiedPlan({ council }: UnifiedPlanProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Final unified plan</p>
      <div className="mt-5 space-y-3">
        {council.final_unified_plan.map((step, index) => (
          <div key={step} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Step {index + 1}</p>
            <p className="mt-1 font-black text-white">{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
