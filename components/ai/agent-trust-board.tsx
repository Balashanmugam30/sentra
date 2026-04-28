import type { CouncilTrustMetric } from "@/lib/ai/types";

type AgentTrustBoardProps = {
  trust: CouncilTrustMetric[];
};

export function AgentTrustBoard({ trust }: AgentTrustBoardProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">Trust by Agent</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Performance tracker</h2>
      <div className="mt-5 grid gap-3">
        {trust.map((agent) => (
          <article key={agent.agent_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{agent.name}</h3>
                <p className="mt-1 text-xs text-slate-500">Drift {agent.confidence_drift} - override {agent.override_rate}%</p>
              </div>
              <p className="text-2xl font-black text-cyan-100">{agent.trust_score}</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
              <span>Accuracy {agent.historical_accuracy}%</span>
              <span>Speed {agent.speed_score}%</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-300" style={{ width: `${agent.trust_score}%` }} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
