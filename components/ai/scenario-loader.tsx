"use client";

import type { AIDecisionScenario } from "@/lib/ai/types";

type ScenarioLoaderProps = {
  scenarios: AIDecisionScenario[];
  activeScenarioId: string;
  busyScenario: string | null;
  onLoad: (scenarioId: string) => void;
};

export function ScenarioLoader({ scenarios, activeScenarioId, busyScenario, onLoad }: ScenarioLoaderProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">Demo / Live Mode</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Scenario loader</h2>
        </div>
        <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100">
          Deterministic AI
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {scenarios.map((scenario) => {
          const isActive = scenario.scenario_id === activeScenarioId;
          const isBusy = busyScenario === scenario.scenario_id;

          return (
            <button
              key={scenario.scenario_id}
              type="button"
              onClick={() => onLoad(scenario.scenario_id)}
              className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:bg-white/[0.08] ${
                isActive
                  ? "border-cyan-300/40 bg-cyan-300/15 shadow-lg shadow-cyan-950/30"
                  : "border-white/10 bg-white/[0.04]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{scenario.label}</p>
                  <p className="mt-1 text-xs text-slate-400">{scenario.scenario_id.replaceAll("_", " ")}</p>
                </div>
                <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">
                  {isBusy ? "Running" : isActive ? "Active" : "Ready"}
                </span>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-slate-300">
                Load a deterministic response model for {scenario.label.toLowerCase()}.
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
