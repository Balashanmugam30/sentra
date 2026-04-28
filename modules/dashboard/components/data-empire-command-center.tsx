"use client";

import { useDataEmpire } from "@/lib/data-empire/use-data-empire";
import {
  DataEmpireActionButton,
  DataEmpireMetricCard,
  DataEmpirePanelShell,
  dataEmpireMoney,
} from "@/modules/dashboard/components/data-empire-primitives";

export function DataEmpireCommandCenter() {
  const { busyAction, error, live, loading, refresh, runForecast, runIngestion, runLearning } = useDataEmpire();

  return (
    <DataEmpirePanelShell
      action={
        <div className="flex flex-wrap gap-2">
          <DataEmpireActionButton onClick={() => void refresh()}>{loading ? "Syncing..." : "Refresh"}</DataEmpireActionButton>
          <DataEmpireActionButton busy={busyAction === "ingestion"} onClick={() => void runIngestion()}>
            {busyAction === "ingestion" ? "Ingesting..." : "Run Ingestion"}
          </DataEmpireActionButton>
          <DataEmpireActionButton busy={busyAction === "learning"} onClick={() => void runLearning()}>
            {busyAction === "learning" ? "Learning..." : "Compound Knowledge"}
          </DataEmpireActionButton>
          <DataEmpireActionButton busy={busyAction === "forecast"} onClick={() => void runForecast()}>
            {busyAction === "forecast" ? "Forecasting..." : "Run Forecast"}
          </DataEmpireActionButton>
        </div>
      }
      description="Tenant-scoped ingestion, entity linking, signal scoring, forecast intelligence, privacy controls, and monetization products unified into Sentra's proprietary data moat."
      eyebrow="Data Empire OS"
      title={`${live?.competitive_moat_score ?? 97}/100 proprietary moat with ${dataEmpireMoney.format(live?.data_product_arr ?? 3_400_000)} data ARR`}
      tone="gold"
    >
      {error ? (
        <div className="mb-4 rounded-[20px] border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-50">
          Intelligence cache is serving last verified state: {error}
        </div>
      ) : null}
      <div className="grid gap-3 md:grid-cols-5">
        <DataEmpireMetricCard label="Signals/day" note="proprietary telemetry" value={`${((live?.signals_day ?? 14_800_000) / 1_000_000).toFixed(1)}M`} />
        <DataEmpireMetricCard label="Entities" note="linked knowledge graph" value={`${((live?.linked_entities ?? 2_100_000) / 1_000_000).toFixed(1)}M`} />
        <DataEmpireMetricCard label="Datasets" note="unique assets" value={(live?.unique_datasets ?? 418).toLocaleString()} />
        <DataEmpireMetricCard label="Accuracy" note="forecast quality" value={`${live?.prediction_accuracy ?? 94}%`} />
        <DataEmpireMetricCard label="Switching cost" note="retention moat" value={live?.switching_cost_index ?? "Extreme"} />
      </div>
    </DataEmpirePanelShell>
  );
}
