"use client";

import { useExecution } from "@/lib/execution/use-execution";
import {
  ExecutionMetricTile,
  ExecutionPanelChrome,
  exList,
  exNumber,
  executionMoney,
} from "@/modules/dashboard/components/execution-panel-primitives";

export function ProductivityCommandCenter() {
  const { productivity } = useExecution();

  return (
    <ExecutionPanelChrome
      description="Productivity AI tracks meetings load, delivery delays, overloaded teams, hiring bottlenecks, revenue per employee, and output efficiency."
      eyebrow="Productivity Command Center"
      title={`${exNumber(productivity?.productivity_score, 86)}% productivity with ${executionMoney.format(exNumber(productivity?.revenue_per_employee, 113_889))} revenue per employee`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <ExecutionMetricTile label="Meetings Load" value={`${exNumber(productivity?.meetings_load, 12)}h/wk`} />
        <ExecutionMetricTile label="Delivery Delays" value={exNumber(productivity?.delivery_delays, 4)} />
        <ExecutionMetricTile label="Output Efficiency" value={`${exNumber(productivity?.output_efficiency, 86)}%`} />
        <ExecutionMetricTile label="Overloaded Teams" value={exList<string>(productivity?.overloaded_teams).length || 2} />
      </div>
    </ExecutionPanelChrome>
  );
}
