"use client";

import { useExecution } from "@/lib/execution/use-execution";
import {
  ExecutionPanelChrome,
  exBar,
  exList,
  executionMoney,
} from "@/modules/dashboard/components/execution-panel-primitives";

type Department = { department: string; owner: string; score: number; spend: number; strain: number };

export function AutonomousDepartmentGrid() {
  const { coo } = useExecution();
  const departments = exList<Department>(coo?.department_performance);

  return (
    <ExecutionPanelChrome
      description="Autonomous department operators watch spend, strain, score, and ownership across the whole company execution graph."
      eyebrow="Autonomous Department Grid"
      title={`${departments.length || 6} departments under executive AI supervision`}
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {departments.map((item) => (
          <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-4" key={item.department}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-white">{item.department}</p>
                <p className="mt-1 text-xs text-white/44">{item.owner}</p>
              </div>
              <span className="text-sm text-cyan-50/72">{item.score}%</span>
            </div>
            <div className="mt-4 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-cyan-300/75" style={{ width: exBar(item.score) }} />
            </div>
            <div className="mt-4 flex justify-between text-xs text-white/50">
              <span>{executionMoney.format(item.spend)} spend</span>
              <span>{item.strain}% strain</span>
            </div>
          </div>
        ))}
      </div>
    </ExecutionPanelChrome>
  );
}
