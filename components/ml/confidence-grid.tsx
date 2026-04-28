type ConfidenceGridProps = {
  items: Array<{ domain: string; confidence: number; state: string }>;
};

export function ConfidenceGrid({ items }: ConfidenceGridProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Confidence heatmap</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <article key={item.domain} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-white">{item.domain}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{item.state}</p>
              </div>
              <span className="text-3xl font-black text-cyan-100">{item.confidence}%</span>
            </div>
            <div className="mt-4 h-2 rounded-full bg-white/10">
              <div className="h-2 rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" style={{ width: `${Math.min(100, Math.max(0, item.confidence))}%` }} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

