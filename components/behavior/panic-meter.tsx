type PanicMeterProps = {
  score: number;
  title?: string;
  caption?: string;
};

export function PanicMeter({ score, title = "Panic index", caption = "Likelihood of fast emotional contagion and disordered movement." }: PanicMeterProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-rose-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-200/70">{title}</p>
      <div className="mt-5 h-4 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-amber-300 to-rose-500" style={{ width: `${Math.min(100, score)}%` }} />
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="text-5xl font-black text-white">{score}</p>
        <p className="max-w-xs text-right text-sm leading-6 text-slate-300">{caption}</p>
      </div>
    </section>
  );
}

