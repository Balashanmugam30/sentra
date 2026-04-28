"use client";

import { useExecution } from "@/lib/execution/use-execution";
import {
  ExecutionMetricTile,
  ExecutionPanelChrome,
  exList,
  exNumber,
  executionMoney,
} from "@/modules/dashboard/components/execution-panel-primitives";

export function EnterpriseEfficiencyPanel() {
  const { efficiency } = useExecution();

  return (
    <ExecutionPanelChrome
      description="Tracks revenue per employee, output efficiency, meeting load, delivery delays, overloaded teams, and hiring bottlenecks."
      eyebrow="Enterprise Efficiency"
      title={`${exNumber(efficiency?.enterprise_efficiency_score, 88)}% enterprise efficiency score`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <ExecutionMetricTile label="Revenue / Employee" value={executionMoney.format(exNumber(efficiency?.revenue_per_employee, 113_889))} />
        <ExecutionMetricTile label="Output Efficiency" value={`${exNumber(efficiency?.output_efficiency, 86)}%`} />
        <ExecutionMetricTile label="Meetings Load" value={`${exNumber(efficiency?.meetings_load_hours_per_week, 12)}h/wk`} />
        <ExecutionMetricTile label="Delivery Delays" value={exNumber(efficiency?.delivery_delays, 4)} />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-[22px] border border-white/10 bg-white/[0.035] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/42">Overloaded teams</p>
          <p className="mt-3 text-sm text-white/64">{exList<string>(efficiency?.overloaded_teams).join(", ") || "Engineering, Revenue"}</p>
        </div>
        <div className="rounded-[22px] border border-white/10 bg-white/[0.035] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/42">Hiring bottlenecks</p>
          <p className="mt-3 text-sm text-white/64">{exList<string>(efficiency?.hiring_bottlenecks).join(", ") || "regional sales, security compliance"}</p>
        </div>
      </div>
    </ExecutionPanelChrome>
  );
}
