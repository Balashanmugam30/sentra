"use client";

import { useExecution } from "@/lib/execution/use-execution";
import {
  ExecutionMetricTile,
  ExecutionPanelChrome,
  executionMoney,
} from "@/modules/dashboard/components/execution-panel-primitives";

export function CompanyKpiMatrix() {
  const { live } = useExecution();

  return (
    <ExecutionPanelChrome
      description="Company-wide execution KPIs for revenue, growth, cash, headcount, footprint, retention, margin, board readiness, and strategic confidence."
      eyebrow="Company KPI Matrix"
      title={`${executionMoney.format(live?.MRR ?? 683_000)} MRR across ${live?.employees ?? 72} employees`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <ExecutionMetricTile label="ARR" value={executionMoney.format(live?.ARR ?? 8_200_000)} />
        <ExecutionMetricTile label="MRR" value={executionMoney.format(live?.MRR ?? 683_000)} />
        <ExecutionMetricTile label="Growth" value={`${live?.growth_percent ?? 171}%`} />
        <ExecutionMetricTile label="Gross Margin" value={`${live?.gross_margin_percent ?? 84}%`} />
        <ExecutionMetricTile label="NPS" value={live?.NPS ?? 61} />
        <ExecutionMetricTile label="LTV/CAC" value={`${live?.LTV_CAC ?? 8.2}x`} />
        <ExecutionMetricTile label="Board Readiness" value={`${live?.board_readiness ?? 93}%`} />
        <ExecutionMetricTile label="Execution Score" value={live?.execution_score ?? 90} />
      </div>
    </ExecutionPanelChrome>
  );
}
