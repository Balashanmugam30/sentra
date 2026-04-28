import type { AICouncilAgent } from "@/lib/ai/types";

type TrustScoreProps = {
  score: number;
  agents: AICouncilAgent[];
};

export function TrustScore({ score, agents }: TrustScoreProps) {
  return (
    <section className="rounded-[2rem] border border-emerald-300/20 bg-emerald-400/10 p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-100/70">Trust engine</p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-6xl font-black tracking-[-0.08em] text-white">{score}</p>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">/100 governed trust</p>
        </div>
        <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-sm font-semibold text-emerald-100">
          calibrated
        </span>
      </div>
      <div className="mt-5 space-y-3">
        {agents.slice(0, 5).map((agent) => (
          <div key={agent.agent_id}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-slate-200">{agent.name}</span>
              <span className="font-bold text-white">{agent.trust_score}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/10">
              <div className="h-2 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300" style={{ width: `${agent.trust_score}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

