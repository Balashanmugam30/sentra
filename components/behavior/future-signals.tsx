import type { FutureSignal } from "@/lib/behavior/learning";

type FutureSignalsProps = {
  signals: FutureSignal[];
};

export function FutureSignals({ signals }: FutureSignalsProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Future risk signals</p>
      <div className="mt-5 space-y-3">
        {signals.map((signal) => (
          <article key={signal.signal} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-white">{signal.signal}</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">Trigger: {signal.trigger}</p>
              </div>
              <span className="text-2xl font-black text-amber-100">{signal.probability}%</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-cyan-100">{signal.countermeasure}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
