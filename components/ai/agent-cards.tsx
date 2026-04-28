import type { CouncilSpecialistAgent } from "@/lib/ai/types";

type AgentCardsProps = {
  agents: CouncilSpecialistAgent[];
};

const toneMap: Record<string, string> = {
  red: "border-red-300/25 bg-red-500/10 text-red-100",
  emerald: "border-emerald-300/25 bg-emerald-500/10 text-emerald-100",
  cyan: "border-cyan-300/25 bg-cyan-500/10 text-cyan-100",
  blue: "border-blue-300/25 bg-blue-500/10 text-blue-100",
  amber: "border-amber-300/25 bg-amber-500/10 text-amber-100",
  violet: "border-violet-300/25 bg-violet-500/10 text-violet-100",
};

export function AgentCards({ agents }: AgentCardsProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">Active Agents</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Specialist council online</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent) => (
          <article key={agent.agent_id} className="rounded-3xl border border-white/10 bg-black/20 p-4 transition hover:-translate-y-0.5 hover:bg-white/[0.06]">
            <div className="flex items-start gap-3">
              <div className={`grid h-12 w-12 place-items-center rounded-2xl border text-lg font-black ${toneMap[agent.color] ?? toneMap.cyan}`}>
                {agent.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-white">{agent.name}</h3>
                    <p className="mt-1 text-xs text-slate-400">{agent.domain}</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">
                    {agent.stance}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{agent.reasoning}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <p className="text-2xl font-black text-white">{agent.urgency_score}</p>
                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Urgency</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <p className="text-2xl font-black text-cyan-100">{agent.confidence}%</p>
                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Confidence</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {agent.top_actions.slice(0, 2).map((action) => (
                <p key={action} className="rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-slate-300">
                  {action}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
