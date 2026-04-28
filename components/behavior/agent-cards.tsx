import type { BehaviorAgent } from "@/lib/behavior/learning";

type AgentCardsProps = {
  agents: BehaviorAgent[];
};

export function AgentCards({ agents }: AgentCardsProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Behavior AI agents</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent) => (
          <article key={agent.agent_id} className="rounded-3xl border border-cyan-300/15 bg-cyan-400/10 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-white">{agent.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-cyan-100/80">{agent.priority}</p>
              </div>
              <span className="text-xl font-black text-cyan-100">{agent.confidence}%</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">{agent.plan}</p>
            <p className="mt-3 text-xs text-slate-400">Constraint: {agent.constraint}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
