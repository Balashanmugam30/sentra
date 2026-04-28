"use client";

import { useExecution } from "@/lib/execution/use-execution";
import {
  ExecutionMetricTile,
  ExecutionPanelChrome,
  exBar,
  exList,
  exNumber,
  exString,
} from "@/modules/dashboard/components/execution-panel-primitives";

type Bottleneck = { team: string; issue: string; severity: number };

export function CooOperationsPanel() {
  const { coo } = useExecution();

  return (
    <ExecutionPanelChrome
      description="COO AI tracks operating cadence, workflow bottlenecks, delivery execution, cross-team friction, and productivity strain."
      eyebrow="COO AI Operating System"
      title={`${exNumber(coo?.delivery_execution, 89)}% delivery execution with ${exNumber(coo?.SLA_health, 94)}% SLA health`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <ExecutionMetricTile label="Productivity" value={`${exNumber(coo?.productivity_score, 86)}%`} />
        <ExecutionMetricTile label="SLA Health" value={`${exNumber(coo?.SLA_health, 94)}%`} />
        <ExecutionMetricTile label="Hiring Velocity" value={exString(coo?.hiring_velocity, "selective")} />
        <ExecutionMetricTile label="Delivery" value={`${exNumber(coo?.delivery_execution, 89)}%`} />
      </div>
      <div className="mt-5 space-y-3">
        {exList<Bottleneck>(coo?.workflow_bottlenecks).map((item) => (
          <div className="rounded-[20px] border border-white/10 bg-white/[0.035] p-4" key={`${item.team}-${item.issue}`}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-white">{item.team}</span>
              <span className="text-orange-100/70">{item.severity}% pressure</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-orange-300/75" style={{ width: exBar(item.severity) }} />
            </div>
            <p className="mt-2 text-xs leading-5 text-white/54">{item.issue}</p>
          </div>
        ))}
      </div>
    </ExecutionPanelChrome>
  );
}
