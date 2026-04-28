import type { CouncilSnapshot } from "@/lib/behavior/learning";

type DebateFeedProps = {
  council: CouncilSnapshot;
};

export function DebateFeed({ council }: DebateFeedProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Debate feed</p>
      <div className="mt-5 space-y-3">
        {council.debate_feed.map((item) => (
          <article key={`${item.round}-${item.speaker}-${item.message}`} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Round {item.round} - {item.speaker}</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">{item.message}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
