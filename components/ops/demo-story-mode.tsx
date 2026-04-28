import type { OpsDemoStoryStep } from "@/lib/ops/types";

type DemoStoryModeProps = {
  steps: OpsDemoStoryStep[];
};

export function DemoStoryMode({ steps }: DemoStoryModeProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-amber-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-100/70">Boardroom Story Mode</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Investor-demo narrative</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {steps.map((step) => (
          <article key={step.step} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Step {step.step}</p>
                <h3 className="mt-1 font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{step.metric}</p>
              </div>
              <span className="rounded-full border border-amber-300/25 bg-amber-400/10 px-3 py-1 text-xs text-amber-100">{step.status}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
