"use client";

import { useAutonomousAI } from "@/lib/ai/use-autonomous-ai";

export function SwarmCommandPanel() {
  const { swarm } = useAutonomousAI();

  return (
    <section className="rounded-[30px] border border-cyan-100/12 bg-[rgba(5,11,22,0.78)] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/56">
            AI Swarm Coordination Engine
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
            Autonomous swarms reallocate response capacity in real time
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58">
            {swarm?.coordination_summary ?? "Swarm coordination is syncing across responders, drones, comms, cyber, traffic, and medical systems."}
          </p>
        </div>
        <div className="rounded-full border border-cyan-200/22 bg-cyan-200/10 px-4 py-2 text-sm font-semibold text-cyan-50">
          Efficiency {swarm?.global_efficiency ?? 0}%
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(swarm?.active_swarms ?? []).map((item) => (
          <article className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4" key={item.swarm_id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white">{item.name}</h3>
                <p className="mt-1 text-xs text-white/48">{item.current_target}</p>
              </div>
              <span className="rounded-full border border-cyan-200/18 bg-cyan-200/8 px-3 py-1 text-xs font-semibold text-cyan-50">
                {item.efficiency_score}%
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-white/62">
              <div className="rounded-2xl border border-white/10 bg-black/18 px-2 py-2">
                Units<br /><span className="font-semibold text-white">{item.units_active}</span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/18 px-2 py-2">
                Reroutes<br /><span className="font-semibold text-white">{item.reroutes}</span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/18 px-2 py-2">
                Mode<br /><span className="font-semibold text-white">{item.autonomy_level.replaceAll("_", " ")}</span>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {item.bottlenecks.map((bottleneck) => (
                <span className="rounded-full border border-amber-200/14 bg-amber-200/8 px-2 py-1 text-xs text-amber-50/76" key={`${item.swarm_id}-${bottleneck}`}>
                  {bottleneck}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
