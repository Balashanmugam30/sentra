import type { AICouncilDebateRound, CouncilDebateRound } from "@/lib/ai/types";

type DebateChamberProps = {
  rounds: Array<CouncilDebateRound | AICouncilDebateRound>;
};

export function DebateChamber({ rounds }: DebateChamberProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-blue-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">Debate Chamber</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Agent negotiation rounds</h2>
      <div className="mt-5 space-y-4">
        {rounds.map((round) => (
          <article key={round.round} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold text-white">Round {round.round}: {round.theme}</h3>
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
                Negotiated
              </span>
            </div>
            <div className="mt-4 grid gap-3">
              {"exchanges" in round ? (
                round.exchanges.map((exchange) => (
                  <div key={`${round.round}-${exchange.agent}`} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <p className="text-sm font-semibold text-cyan-100">{exchange.agent}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-200">{exchange.position}</p>
                    <p className="mt-2 text-xs leading-5 text-amber-100/80">Challenge: {exchange.challenge}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="text-sm font-semibold text-cyan-100">{round.speaker}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">{round.position}</p>
                  <p className="mt-2 text-xs leading-5 text-amber-100/80">Challenge: {round.challenge}</p>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
