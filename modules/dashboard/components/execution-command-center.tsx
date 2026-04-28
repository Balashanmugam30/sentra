"use client";

import { useExecution } from "@/lib/execution/use-execution";
import {
  ExecutionActionButton,
  ExecutionMetricTile,
  ExecutionPanelChrome,
  compactExecutionMoney,
  executionMoney,
} from "@/modules/dashboard/components/execution-panel-primitives";

export function ExecutionCommandCenter() {
  const { live, loading, error, refresh, runReview, growthMode, costMode, busyAction } = useExecution();

  return (
    <ExecutionPanelChrome
      action={
        <>
          <ExecutionActionButton onClick={() => void refresh()}>{loading ? "Syncing..." : "Refresh"}</ExecutionActionButton>
          <ExecutionActionButton disabled={busyAction === "review"} onClick={() => void runReview()} tone="gold">
            Run CEO Review
          </ExecutionActionButton>
          <ExecutionActionButton disabled={busyAction === "growth"} onClick={() => void growthMode()}>
            Growth Mode
          </ExecutionActionButton>
          <ExecutionActionButton disabled={busyAction === "cost"} onClick={() => void costMode()} tone="red">
            Cost Defense
          </ExecutionActionButton>
        </>
      }
      description="The autonomous company operating layer fuses board priorities, department AI, capital allocation, workflow automation, org simulation, and executive council decisions."
      eyebrow="Autonomous Enterprise Execution OS"
      title={`${compactExecutionMoney.format(live?.ARR ?? 8_200_000)} ARR company execution score ${live?.execution_score ?? 90}`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <ExecutionMetricTile label="ARR" note={`${live?.growth_percent ?? 171}% growth`} value={executionMoney.format(live?.ARR ?? 8_200_000)} />
        <ExecutionMetricTile label="Cash" note={`${live?.runway_months ?? 36} month runway`} value={executionMoney.format(live?.cash_balance ?? 9_400_000)} />
        <ExecutionMetricTile label="Countries" note="global footprint" value={live?.countries ?? 10} />
        <ExecutionMetricTile label="CEO Confidence" note="strategic signal" value={`${live?.CEO_confidence ?? 88}%`} />
      </div>
      {error ? (
        <div className="mt-4 rounded-[20px] border border-orange-300/20 bg-orange-400/10 p-4 text-sm text-orange-50">
          Execution telemetry delayed. Showing last verified operating state.
        </div>
      ) : null}
    </ExecutionPanelChrome>
  );
}
