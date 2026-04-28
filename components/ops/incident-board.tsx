import type { OpsIncident, OpsExecutionScenario } from "@/lib/ops/types";

type IncidentBoardProps = {
  incidents: OpsIncident[];
  scenarios: OpsExecutionScenario[];
  activeScenario: string;
  busyAction: string | null;
  onRunScenario: (scenarioId: string) => void;
};

export function IncidentBoard({ incidents, scenarios, activeScenario, busyAction, onRunScenario }: IncidentBoardProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">Active Incidents</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Execution scenario control</h2>
        </div>
        <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
          Live + Demo Ready
        </span>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-3">
          {incidents.map((incident) => (
            <article key={incident.incident_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-white">{incident.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{incident.building} - {incident.zone}</p>
                </div>
                <span className="rounded-full border border-rose-300/25 bg-rose-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-rose-100">
                  {incident.severity}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <span className="rounded-2xl bg-white/[0.05] px-3 py-2 text-xs text-slate-300">Workflow {incident.workflow}</span>
                <span className="rounded-2xl bg-white/[0.05] px-3 py-2 text-xs text-slate-300">ETA {incident.recovery_eta}</span>
                <span className="rounded-2xl bg-white/[0.05] px-3 py-2 text-xs text-slate-300">Confidence {incident.confidence}%</span>
              </div>
            </article>
          ))}
        </div>
        <div className="grid gap-2">
          {scenarios.map((scenario) => (
            <button
              key={scenario.scenario_id}
              type="button"
              onClick={() => onRunScenario(scenario.scenario_id)}
              disabled={Boolean(busyAction)}
              className={`rounded-2xl border p-3 text-left text-sm transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60 ${
                scenario.scenario_id === activeScenario ? "border-cyan-300/35 bg-cyan-300/10 text-cyan-50" : "border-white/10 bg-white/[0.035] text-slate-300"
              }`}
            >
              {busyAction === scenario.scenario_id ? "Launching..." : scenario.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
