import { twinTone } from "@/lib/twin/runtime";
import type { TwinPredictiveState } from "@/lib/twin/types";

export function PredictiveRiskRadar({ predictive }: { predictive: TwinPredictiveState }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-rose-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-200/70">Predictive Twin Intelligence</p>
      <h2 className="mt-2 text-2xl font-black text-white">Risk Radar</h2>
      <div className="mt-5 grid gap-4 lg:grid-cols-[0.42fr_0.58fr]">
        <div className="rounded-full border border-rose-300/20 bg-rose-400/10 p-8 text-center shadow-[0_0_60px_rgba(244,63,94,0.18)]">
          <p className="text-6xl font-black text-white">{predictive.highest_risk}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-rose-100/70">highest risk</p>
          <p className="mt-4 text-sm leading-6 text-rose-100/75">{predictive.next_best_action}</p>
        </div>
        <div className="space-y-3">
          {predictive.predictions.map((prediction) => (
            <article key={prediction.prediction_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${twinTone(prediction.risk)}`}>{prediction.domain.replaceAll("_", " ")}</span>
                  <h3 className="mt-3 font-black text-white">{prediction.facility}</h3>
                  <p className="mt-1 text-sm text-slate-400">{prediction.recommended_action}</p>
                </div>
                <p className="text-2xl font-black text-white">{prediction.risk}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

