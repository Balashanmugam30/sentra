"use client";

import { useAutonomousAI } from "@/lib/ai/use-autonomous-ai";

function tone(score: number) {
  if (score >= 82) {
    return "border-cyan-200/24 bg-cyan-200/10 text-cyan-50";
  }
  if (score >= 70) {
    return "border-amber-200/24 bg-amber-200/10 text-amber-50";
  }
  return "border-white/10 bg-white/[0.045] text-white/76";
}

export function SpecialistAgentNetworkPanel() {
  const { specialistAgents } = useAutonomousAI();
  const agents = specialistAgents?.agents ?? [];

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(6,11,22,0.76)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">
            Specialist Agent Network
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
            Six persistent agents score strategy through different priorities
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-white/56">
          {specialistAgents?.network_summary ?? "Agent positions are calibrating against live strategy branches."}
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent) => (
          <article className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4" key={agent.agent_id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white">{agent.name}</h3>
                <p className="mt-1 text-[0.62rem] uppercase tracking-[0.16em] text-white/42">
                  {agent.domain.replaceAll("_", " ")}
                </p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone(agent.strategy_score)}`}>
                {agent.strategy_score}%
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/62">{agent.current_position}</p>
            <div className="mt-4 rounded-[18px] border border-white/10 bg-black/18 p-3">
              <p className="text-xs uppercase tracking-[0.16em] text-white/38">Mission</p>
              <p className="mt-2 text-xs leading-5 text-white/58">{agent.mission}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
