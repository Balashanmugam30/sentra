import type { LearningWeakSignal } from "@/lib/ai/types";

type WeakSignalRadarProps = {
  signals: LearningWeakSignal[];
};

export function WeakSignalRadar({ signals }: WeakSignalRadarProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-amber-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-100/70">Weak Signal Radar</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Possible issues forming</h2>
      <div className="mt-5 grid gap-3">
        {signals.map((signal) => (
          <article key={signal.signal_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{signal.signal}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{signal.source} - {signal.time_to_risk}</p>
              </div>
              <span className="rounded-full border border-amber-300/25 bg-amber-400/10 px-3 py-1 text-sm font-bold text-amber-100">
                {signal.probability}%
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">{signal.recommended_action}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
