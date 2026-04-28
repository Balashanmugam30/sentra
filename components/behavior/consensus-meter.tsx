import type { CouncilSnapshot } from "@/lib/behavior/learning";

type ConsensusMeterProps = {
  council: CouncilSnapshot;
};

export function ConsensusMeter({ council }: ConsensusMeterProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Consensus meter</p>
      <div className="mt-5 flex items-center gap-5">
        <div className="grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-emerald-300 to-cyan-300 text-slate-950">
          <div className="text-center">
            <p className="text-4xl font-black">{council.consensus.score}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">score</p>
          </div>
        </div>
        <div>
          <p className="text-2xl font-black text-white">{council.consensus.alignment} alignment</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">{council.consensus.dissent}</p>
          <p className="mt-2 text-sm text-cyan-100">{council.consensus.confidence}% confidence</p>
        </div>
      </div>
    </section>
  );
}
