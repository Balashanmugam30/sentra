import type { TwinScenario } from "@/lib/twin/types";

type ScenarioLauncherProps = {
  scenarios: TwinScenario[];
  busyAction: string | null;
  onSimulate: (scenarioId?: string) => void;
};

export function ScenarioLauncher({ scenarios, busyAction, onSimulate }: ScenarioLauncherProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-amber-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/70">Training Simulator</p>
      <h2 className="mt-2 text-2xl font-black text-white">Scenario Trainer</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {scenarios.map((scenario) => (
          <article key={scenario.scenario_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-black text-white">{scenario.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{scenario.objective}</p>
              </div>
              <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-100">{scenario.difficulty}</span>
            </div>
            <button type="button" onClick={() => onSimulate(scenario.scenario_id)} className="mt-4 w-full rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm font-bold text-amber-50 transition hover:bg-amber-300/20">
              {busyAction === "simulate" ? "Simulating..." : `Run ${scenario.estimated_duration_min}m drill`}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

