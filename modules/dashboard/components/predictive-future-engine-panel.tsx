"use client";

import { useAutonomousAI } from "@/lib/ai/use-autonomous-ai";

export function PredictiveFutureEnginePanel() {
  const { forecast, loading, runForecast, testScenario } = useAutonomousAI();
  const horizons = forecast?.forecasts ?? [];

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.76)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/62">
            Predictive Future Engine
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Forward simulation across 5 minutes to 6 hours
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-full border border-cyan-200/22 bg-cyan-200/10 px-4 py-2 text-sm font-semibold text-cyan-50"
            disabled={loading}
            onClick={() => {
              void runForecast();
            }}
            type="button"
          >
            {loading ? "Syncing forecast" : "Run Forecast"}
          </button>
          <button
            className="rounded-full border border-rose-200/22 bg-rose-200/10 px-4 py-2 text-sm font-semibold text-rose-50"
            onClick={() => {
              void testScenario("tower_fire_spread");
            }}
            type="button"
          >
            Tower Fire
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-5">
        {horizons.map((item) => (
          <article className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4" key={item.horizon}>
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/42">{item.horizon}</p>
            <div className="mt-3 text-2xl font-semibold text-white">{item.containment_probability}%</div>
            <p className="mt-1 text-xs text-white/48">Containment probability</p>
            <div className="mt-4 space-y-2 text-xs text-white/62">
              <div>Escalation {item.escalation_probability}%</div>
              <div>Casualty risk {item.casualties_risk}%</div>
              <div>Downtime {item.downtime_minutes}m</div>
              <div>Loss {item.projected_loss}</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

