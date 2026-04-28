"use client";

import { useDataEmpire } from "@/lib/data-empire/use-data-empire";
import {
  DataEmpireActionButton,
  DataEmpireBar,
  DataEmpireMetricCard,
  DataEmpirePanelShell,
  dataEmpireMoney,
} from "@/modules/dashboard/components/data-empire-primitives";

const horizons = ["1h", "24h", "7d", "30d", "90d", "1y", "5y"];

export function ForecastSuperintelligence() {
  const { busyAction, forecasts, runForecast } = useDataEmpire();
  const highConfidence = forecasts.filter((forecast) => forecast.confidence >= 90).length;
  const topForecast = forecasts[0];

  return (
    <DataEmpirePanelShell
      action={
        <DataEmpireActionButton busy={busyAction === "forecast"} onClick={() => void runForecast()}>
          {busyAction === "forecast" ? "Forecasting..." : "Refresh 7 Horizons"}
        </DataEmpireActionButton>
      }
      description="Seven-horizon forecasting across revenue, threats, climate, politics, demand, shortages, user growth, and global risk."
      eyebrow="Forecast Superintelligence"
      title={`${highConfidence || 42} high-confidence future paths are currently actionable`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <DataEmpireMetricCard label="Horizons" value={horizons.join(" / ")} />
        <DataEmpireMetricCard label="Top domain" value={topForecast?.domain ?? "threats"} />
        <DataEmpireMetricCard label="Expected value" value={dataEmpireMoney.format(topForecast?.expected_value ?? 1_450_000)} />
        <DataEmpireMetricCard label="Confidence" value={`${topForecast?.confidence ?? 94}%`} />
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {forecasts.slice(0, 8).map((forecast) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={`${forecast.horizon}-${forecast.domain}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{forecast.domain}</p>
                <p className="mt-1 text-xs text-white/42">{forecast.horizon} horizon - {forecast.risk_level}</p>
              </div>
              <span className="rounded-full border border-cyan-200/16 bg-cyan-200/8 px-3 py-1 text-xs font-semibold text-cyan-50">
                {forecast.confidence}%
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/58">{forecast.forecast}</p>
            <div className="mt-4">
              <DataEmpireBar label="Expected value" max={2_000_000} value={forecast.expected_value} />
            </div>
          </div>
        ))}
      </div>
    </DataEmpirePanelShell>
  );
}
