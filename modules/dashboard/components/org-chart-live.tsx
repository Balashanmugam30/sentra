"use client";

import { useExecution } from "@/lib/execution/use-execution";
import {
  ExecutionPanelChrome,
  ExecutionPill,
  exList,
  exNumber,
} from "@/modules/dashboard/components/execution-panel-primitives";

type Department = { department: string; owner: string; score: number; strain: number };

export function OrgChartLive() {
  const { live, coo } = useExecution();
  const departments = exList<Department>(coo?.department_performance);

  return (
    <ExecutionPanelChrome
      description="Live org graph showing executive ownership, department score, strain, and where AI should reduce drag first."
      eyebrow="Live Org Chart"
      title={`${live?.employees ?? 72} employees across ${departments.length || 6} execution cells`}
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {departments.map((item) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.035] p-4" key={`${item.department}-${item.owner}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{item.department}</p>
                <p className="text-xs text-white/42">{item.owner}</p>
              </div>
              <ExecutionPill label={`${item.score}%`} tone={item.score >= 90 ? "gold" : "cyan"} />
            </div>
            <p className="mt-3 text-xs text-white/50">Execution strain: {exNumber(item.strain)}%</p>
          </div>
        ))}
      </div>
    </ExecutionPanelChrome>
  );
}
