"use client";

import type { UseEnvironmentResult } from "@/lib/environment/use-environment";

type EnvironmentPanelProps = {
  environment: UseEnvironmentResult;
  canManageEnvironment: boolean;
};

export function EnvironmentPanel({
  environment,
  canManageEnvironment,
}: EnvironmentPanelProps) {
  const { alerts, busyAction, error, lastUpdated, live, loading, refresh, runScenario, status } =
    environment;
  const weatherTemperature = live?.weather?.temperature_c;
  const weatherCondition = live?.weather?.condition;
  const airQualityIndex = live?.air_quality?.aqi;
  const airQualityBand = live?.air_quality?.risk_band;

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.78)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-200/70">
              Environmental Threat Center
            </p>
            <h2 className="text-lg font-semibold text-white">
              Live weather, air-quality, and climate-aware operational pressure across the command grid
            </h2>
          </div>
          <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs uppercase tracking-[0.16em] text-cyan-100">
            {loading ? "Syncing climate" : `${status} • ${live?.provider ?? "demo"} provider`}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          {[
            [
              "Current Weather",
              weatherTemperature !== undefined && weatherCondition
                ? `${Math.round(weatherTemperature)}C ${weatherCondition}`
                : "--",
            ],
            [
              "AQI",
              airQualityIndex !== undefined && airQualityBand
                ? `${airQualityIndex} ${airQualityBand}`
                : "--",
            ],
            ["Hazard Score", live?.global_hazard_score !== undefined ? String(live.global_hazard_score) : "--"],
            ["Provider", live?.provider ?? "--"],
            ["Updated", live?.updated_at ? new Date(live.updated_at).toLocaleTimeString() : "--"],
          ].map(([label, value], index) => (
            <div
              className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4"
              key={`${label}-${index}`}
            >
              <div className="text-[0.68rem] uppercase tracking-[0.16em] text-cyan-200/60">{label}</div>
              <div className="mt-2 text-sm font-medium text-white">{value}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {canManageEnvironment ? (
            <>
              <button
                className="rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm font-medium text-sky-100 disabled:opacity-50"
                disabled={busyAction !== null}
                onClick={() => {
                  void runScenario("cyclone");
                }}
                type="button"
              >
                {busyAction === "scenario-cyclone" ? "Running..." : "Run Cyclone"}
              </button>
              <button
                className="rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-100 disabled:opacity-50"
                disabled={busyAction !== null}
                onClick={() => {
                  void runScenario("heatwave");
                }}
                type="button"
              >
                {busyAction === "scenario-heatwave" ? "Running..." : "Run Heatwave"}
              </button>
            </>
          ) : null}
          <button
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            disabled={busyAction !== null}
            onClick={() => {
              void refresh();
            }}
            type="button"
          >
            Refresh
          </button>
        </div>

        {alerts?.alerts?.length ? (
          <div className="flex flex-wrap gap-2">
            {alerts.alerts.map((alert, index) => (
              <span
                className="rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1 text-xs uppercase tracking-[0.14em] text-rose-100"
                key={`${alert.alert_id}-${alert.title}-${index}`}
              >
                {alert.title}
              </span>
            ))}
          </div>
        ) : null}

        {lastUpdated ? (
          <p className="text-xs uppercase tracking-[0.14em] text-white/40">
            Last good sync {new Date(lastUpdated).toLocaleTimeString()}
          </p>
        ) : null}
        {error ? (
          <div className="rounded-[20px] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {status === "stale" ? "Showing last known environmental state while reconnecting. " : ""}
            {error}
          </div>
        ) : null}
      </div>
    </section>
  );
}
