"use client";

import { getRecoveryTone } from "@/lib/ops/recovery";
import type { OpsDamageAssessment, OpsRecoveryScenario, OpsRecoveryTask } from "@/lib/ops/types";

type RecoveryBoardProps = {
  scenarios: OpsRecoveryScenario[];
  damage: OpsDamageAssessment[];
  tasks: OpsRecoveryTask[];
  activeScenario: string;
  busyAction: string | null;
  onRunScenario: (scenarioId: string) => void;
};

export function RecoveryBoard({ scenarios, damage, tasks, activeScenario, busyAction, onRunScenario }: RecoveryBoardProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">Damage Assessment</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Recovery workflow command</h2>
      <div className="mt-5 grid gap-2 md:grid-cols-3">
        {scenarios.map((scenario) => (
          <button
            key={scenario.scenario_id}
            type="button"
            onClick={() => onRunScenario(scenario.scenario_id)}
            disabled={Boolean(busyAction)}
            className={`rounded-2xl border px-3 py-3 text-left text-sm transition disabled:opacity-60 ${
              scenario.scenario_id === activeScenario ? "border-cyan-300/35 bg-cyan-300/10 text-cyan-50" : "border-white/10 bg-black/20 text-slate-300"
            }`}
          >
            {scenario.label}
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {damage.map((item) => (
          <article key={item.area} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <h3 className="font-semibold text-white">{item.area}</h3>
            <p className="mt-2 text-sm text-slate-300">{item.damage}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">{item.estimated_loss} - {item.clearance_eta}</p>
          </article>
        ))}
      </div>
      <div className="mt-5 grid gap-3">
        {tasks.map((task) => (
          <article key={task.task_id} className={`rounded-3xl border p-4 ${getRecoveryTone(task.status)}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{task.title}</h3>
                <p className="mt-1 text-xs opacity-70">{task.owner} - {task.stage.replaceAll("_", " ")}</p>
              </div>
              <span className="text-2xl font-black text-white">{task.progress}%</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-black/20">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" style={{ width: `${task.progress}%` }} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
