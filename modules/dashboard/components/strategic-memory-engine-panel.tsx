"use client";

import { useAutonomousAI } from "@/lib/ai/use-autonomous-ai";

function formatStrategy(value: string) {
  return value.replaceAll("_", " ");
}

export function StrategicMemoryEnginePanel() {
  const { advancedMemory, busyAction, runStrategicLearningCycle } = useAutonomousAI();
  const topStrategies = advancedMemory?.best_performing_strategies ?? [];

  return (
    <section className="rounded-[30px] border border-cyan-100/12 bg-[rgba(5,10,20,0.74)] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/56">
            Strategic Memory Engine 2.0
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
            Learning from outcomes, overrides, and stabilization quality
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58">
            {advancedMemory?.learning_summary ?? "Syncing learned strategy memory from prior autonomous decisions."}
          </p>
        </div>
        <button
          className="rounded-full border border-cyan-200/24 bg-cyan-200/10 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-200/16 disabled:opacity-55"
          disabled={busyAction === "strategic-learning-cycle"}
          onClick={() => {
            void runStrategicLearningCycle("fire_corridor_blocked");
          }}
          type="button"
        >
          {busyAction === "strategic-learning-cycle" ? "Learning..." : "Run Learning Cycle"}
        </button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {[
          ["State", advancedMemory?.learning_state ?? "syncing"],
          ["Episodes", String(advancedMemory?.episodes_tracked ?? 0)],
          ["Trusted Playbooks", String(advancedMemory?.trusted_playbooks?.length ?? 0)],
        ].map(([label, value]) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={label}>
            <p className="text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-white/42">{label}</p>
            <p className="mt-3 text-xl font-semibold capitalize text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
          <p className="text-sm font-semibold text-white">Best performing strategies</p>
          <div className="mt-4 space-y-3">
            {topStrategies.slice(0, 4).map((strategy) => (
              <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-3" key={strategy.strategy}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold capitalize text-white">{formatStrategy(strategy.strategy)}</p>
                  <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs text-cyan-50">
                    {strategy.score}%
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-white/54">{strategy.reason}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[24px] border border-amber-200/14 bg-amber-200/[0.055] p-4">
          <p className="text-sm font-semibold text-amber-50">Policy friction detected</p>
          <div className="mt-4 space-y-3">
            {(advancedMemory?.failure_patterns ?? []).slice(0, 3).map((pattern, index) => (
              <div className="rounded-[20px] border border-white/10 bg-black/18 p-3" key={`${pattern.pattern}-${index}`}>
                <p className="text-sm font-semibold capitalize text-white">{formatStrategy(pattern.pattern)}</p>
                <p className="mt-1 text-xs text-amber-50/72">{pattern.recommended_fix}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
