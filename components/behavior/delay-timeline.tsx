type DelayTimelineProps = {
  timeline: Array<Record<string, unknown>>;
};

export function DelayTimeline({ timeline }: DelayTimelineProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-slate-950/25 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">Human delay timeline</p>
      <div className="mt-5 space-y-3">
        {timeline.map((item) => {
          const risk = Number(item.risk ?? 0);
          return (
            <article key={String(item.time)} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-white">{String(item.time)}</p>
                <p className="text-xl font-black text-amber-100">{risk}</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-amber-300" style={{ width: `${Math.min(100, risk)}%` }} />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">{String(item.event)}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

