import type { CouncilConsensus } from "@/lib/ai/types";

type ConsensusMeterProps = {
  consensus: CouncilConsensus;
};

export function ConsensusMeter({ consensus }: ConsensusMeterProps) {
  return (
    <section className="rounded-[2rem] border border-cyan-300/20 bg-gradient-to-br from-cyan-300/12 via-slate-950/80 to-emerald-300/10 p-5 shadow-2xl shadow-cyan-950/30 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-100/70">Consensus Score</p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-6xl font-black tracking-[-0.08em] text-white">{consensus.consensus_score}</p>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">/100 agreement</p>
        </div>
        <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-sm font-semibold text-emerald-100">
          {consensus.alignment_percent}% aligned
        </span>
      </div>
      <div className="mt-5 h-3 rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300 shadow-lg shadow-cyan-500/30" style={{ width: `${consensus.consensus_score}%` }} />
      </div>
      <p className="mt-5 text-sm leading-6 text-slate-200">{consensus.final_merged_strategy}</p>
      {consensus.dissenting_agents.length > 0 ? (
        <p className="mt-3 text-xs text-amber-100/80">Dissent requiring monitoring: {consensus.dissenting_agents.join(", ")}</p>
      ) : null}
    </section>
  );
}
