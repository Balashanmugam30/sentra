"use client";

import type { OpsStrategyOption } from "@/lib/ops/types";

type StrategySimulatorProps = {
  options: OpsStrategyOption[];
  selected: OpsStrategyOption;
  busyAction: string | null;
  onSimulate: (optionId: string) => void;
};

export function StrategySimulator({ options, selected, busyAction, onSimulate }: StrategySimulatorProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-violet-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-violet-100/70">Strategy Simulator</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Board decision comparison</h2>
      <div className="mt-5 grid gap-3">
        {options.map((option) => (
          <article key={option.option_id} className={`rounded-3xl border p-4 ${option.option_id === selected.option_id ? "border-cyan-300/35 bg-cyan-300/10" : "border-white/10 bg-white/[0.04]"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{option.label}</h3>
                <p className="mt-2 text-sm text-slate-300">{option.reputation_impact}</p>
              </div>
              <span className="text-2xl font-black text-white">{option.risk}</span>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              <span className="rounded-2xl bg-black/20 px-3 py-2 text-xs text-slate-300">Cost {option.cost}</span>
              <span className="rounded-2xl bg-black/20 px-3 py-2 text-xs text-slate-300">Downtime {option.downtime}</span>
              <span className="rounded-2xl bg-black/20 px-3 py-2 text-xs text-slate-300">Recovery {option.recovery_time}</span>
            </div>
            <button
              type="button"
              onClick={() => onSimulate(option.option_id)}
              disabled={busyAction === option.option_id}
              className="mt-4 rounded-2xl border border-violet-300/25 bg-violet-300/10 px-4 py-2 text-sm font-semibold text-violet-50 transition hover:bg-violet-300/20 disabled:opacity-60"
            >
              Run Simulation
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
