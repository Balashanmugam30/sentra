type ConfidenceTrailProps = {
  trail: Array<{ signal: string; score: number; effect: string }>;
};

export function ConfidenceTrail({ trail }: ConfidenceTrailProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">Confidence trail</p>
      <div className="mt-5 space-y-4">
        {trail.map((item) => (
          <article key={item.signal}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{item.signal}</p>
                <p className="mt-1 text-sm text-slate-300">{item.effect}</p>
              </div>
              <span className="text-2xl font-black text-cyan-100">{item.score}</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div className="h-2 rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" style={{ width: `${item.score}%` }} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

