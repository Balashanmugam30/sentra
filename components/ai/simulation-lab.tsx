"use client";

import type { SimulationScenario } from "@/lib/ai/types";

type SimulationLabProps = {
  simulations: SimulationScenario[];
  busyAction: string | null;
  onRun: (scenarioId: string) => void;
};

export function SimulationLab({ simulations, busyAction, onRun }: SimulationLabProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-blue-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">Simulation Training Lab</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Virtual scenarios that improve scores</h2>
      <div className="mt-5 grid gap-3">
        {simulations.map((scenario) => (
          <article key={scenario.scenario_id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{scenario.label}</h3>
                <p className="mt-1 text-sm text-slate-400">{scenario.best_plan}</p>
              </div>
              <span className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 text-sm font-bold text-emerald-100">
                {scenario.improvement}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{scenario.runs} runs</p>
              <button
                type="button"
                onClick={() => onRun(scenario.scenario_id)}
                disabled={Boolean(busyAction)}
                className="rounded-2xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busyAction === scenario.scenario_id ? "Running..." : "Run Simulation"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
