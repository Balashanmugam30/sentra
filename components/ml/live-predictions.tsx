import type { MLOpsPrediction } from "@/lib/mlops/types";

type LivePredictionsProps = {
  predictions: MLOpsPrediction[];
};

function severityTone(severity: string) {
  if (severity === "critical") {
    return "border-red-300/30 bg-red-500/10 text-red-100";
  }
  if (severity === "high") {
    return "border-amber-300/30 bg-amber-500/10 text-amber-100";
  }
  return "border-cyan-300/30 bg-cyan-500/10 text-cyan-100";
}

export function LivePredictions({ predictions }: LivePredictionsProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Live predictions</p>
          <h2 className="mt-2 text-2xl font-black text-white">Risk alerts streaming</h2>
        </div>
        <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-100">online</span>
      </div>
      <div className="mt-5 space-y-3">
        {predictions.slice(0, 5).map((prediction) => (
          <article key={prediction.prediction_id} className="rounded-3xl border border-white/10 bg-black/25 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-black text-white">{prediction.zone}</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">{prediction.recommended_action}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${severityTone(prediction.severity_class)}`}>{prediction.severity_class}</span>
            </div>
            <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
              <span className="rounded-2xl bg-white/5 px-3 py-2 text-slate-300">Risk <b className="text-white">{prediction.risk_score}</b></span>
              <span className="rounded-2xl bg-white/5 px-3 py-2 text-slate-300">Confidence <b className="text-white">{prediction.confidence}%</b></span>
              <span className="rounded-2xl bg-white/5 px-3 py-2 text-slate-300">ETA <b className="text-white">{prediction.eta_minutes}m</b></span>
              <span className="rounded-2xl bg-white/5 px-3 py-2 text-slate-300">Latency <b className="text-white">{prediction.latency_ms}ms</b></span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

