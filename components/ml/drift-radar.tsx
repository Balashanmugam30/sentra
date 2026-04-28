import { driftTone } from "@/lib/mlops/runtime";
import type { DriftSignal } from "@/lib/mlops/types";

type DriftRadarProps = {
  drift: DriftSignal[];
};

export function DriftRadar({ drift }: DriftRadarProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Drift radar</p>
      <div className="mt-5 space-y-3">
        {drift.map((signal) => (
          <article key={signal.drift_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-black text-white">{signal.feature}</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">{signal.reason}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${driftTone(signal.level)}`}>{signal.level}</span>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-2 flex-1 rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-gradient-to-r from-amber-300 to-red-400" style={{ width: `${Math.min(100, signal.drift_score * 3)}%` }} />
              </div>
              <span className="text-sm font-bold text-white">{signal.drift_score}</span>
            </div>
            <p className="mt-3 text-sm text-cyan-100">{signal.recommended_action}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

