import type { TwinCampusState, TwinForecast, TwinPredictiveState, TwinResourcesState } from "@/lib/twin/types";

export function ExecutiveSummary({ predictive, forecast, resources, campus }: { predictive: TwinPredictiveState; forecast: TwinForecast; resources: TwinResourcesState; campus: TwinCampusState }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Executive Twin Copilot</p>
      <h2 className="mt-2 text-2xl font-black text-white">Command Summary</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <Metric label="Prediction" value={`${predictive.prediction_score}%`} />
        <Metric label="Forecast" value={`${forecast.confidence}%`} />
        <Metric label="Reserve" value={`${Math.round(resources.reserve_health)}%`} />
        <Metric label="Campus" value={`${Math.round(campus.average_health)}%`} />
      </div>
      <p className="mt-4 rounded-3xl border border-cyan-300/15 bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-50">{predictive.next_best_action}</p>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

