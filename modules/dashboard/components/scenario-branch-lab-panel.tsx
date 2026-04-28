"use client";

import { useAutonomousAI } from "@/lib/ai/use-autonomous-ai";

export function ScenarioBranchLabPanel() {
  const { compareStrategies, scenarios } = useAutonomousAI();
  const branches = scenarios?.branches ?? [];

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.76)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/62">
            Scenario Branch Lab
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            A/B/C/D response strategy comparison
          </h2>
        </div>
        <button
          className="rounded-full border border-amber-200/22 bg-amber-200/10 px-4 py-2 text-sm font-semibold text-amber-50"
          onClick={() => {
            void compareStrategies();
          }}
          type="button"
        >
          Compare Strategies
        </button>
      </div>

      <div className="mt-5 rounded-[24px] border border-cyan-200/14 bg-cyan-200/8 p-4">
        <p className="text-sm font-semibold text-cyan-50">
          Winning strategy: {scenarios?.winning_strategy?.strategy ?? "syncing strategy lab"}
        </p>
        <p className="mt-2 text-sm text-cyan-50/66">{scenarios?.winning_strategy?.rationale}</p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {branches.map((branch) => (
          <article className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={branch.option}>
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/42">Option {branch.option}</p>
            <h3 className="mt-2 text-base font-semibold text-white">{branch.strategy}</h3>
            <div className="mt-4 space-y-2 text-xs text-white/62">
              <div>Casualty risk {branch.casualty_risk}%</div>
              <div>Containment {branch.containment_chance}%</div>
              <div>Reputation {branch.reputation_impact}%</div>
              <div>Cost {branch.financial_cost}</div>
              <div>Score {branch.score}</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

