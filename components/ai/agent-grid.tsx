import type { AICouncilAgent } from "@/lib/ai/types";

type AgentGridProps = {
  agents: AICouncilAgent[];
};

const toneMap: Record<string, string> = {
  cyan: "border-cyan-300/25 bg-cyan-500/10 text-cyan-100",
  emerald: "border-emerald-300/25 bg-emerald-500/10 text-emerald-100",
  blue: "border-blue-300/25 bg-blue-500/10 text-blue-100",
  amber: "border-amber-300/25 bg-amber-500/10 text-amber-100",
  violet: "border-violet-300/25 bg-violet-500/10 text-violet-100",
  indigo: "border-indigo-300/25 bg-indigo-500/10 text-indigo-100",
  rose: "border-rose-300/25 bg-rose-500/10 text-rose-100",
  slate: "border-slate-300/25 bg-slate-500/10 text-slate-100",
};

export function AgentGrid({ agents }: AgentGridProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">Persistent specialists</p>
      <h2 className="mt-2 text-2xl font-black text-white">AI decision council online</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {agents.map((agent) => (
          <article key={agent.agent_id} className="rounded-3xl border border-white/10 bg-black/20 p-4 transition hover:-translate-y-0.5 hover:bg-white/[0.06]">
            <div className="flex items-start justify-between gap-3">
              <div className={`grid h-12 min-w-12 place-items-center rounded-2xl border px-2 text-xs font-black ${toneMap[agent.color] ?? toneMap.cyan}`}>
                {agent.avatar}
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">
                {agent.recommended_option_label}
              </span>
            </div>
            <h3 className="mt-4 font-black text-white">{agent.name}</h3>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{agent.role}</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">{agent.reasoning}</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Metric label="Trust" value={agent.trust_score} />
              <Metric label="Align" value={agent.alignment_with_plan} />
              <Metric label="Urgency" value={agent.urgency} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <p className="text-lg font-black text-white">{value}</p>
      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
    </div>
  );
}

