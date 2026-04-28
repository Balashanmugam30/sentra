"use client";

import { useExecution } from "@/lib/execution/use-execution";
import {
  ExecutionActionButton,
  ExecutionPanelChrome,
  ExecutionPill,
  exList,
  executionMoney,
} from "@/modules/dashboard/components/execution-panel-primitives";

type CostMove = { title: string; annual_savings: number; risk: string };

export function CostReductionEngine() {
  const { efficiency, costMode, busyAction } = useExecution();

  return (
    <ExecutionPanelChrome
      action={
        <ExecutionActionButton disabled={busyAction === "cost"} onClick={() => void costMode()} tone="red">
          Activate Cost Defense
        </ExecutionActionButton>
      }
      description="Identifies budget leakage without damaging strategic growth velocity or enterprise readiness."
      eyebrow="Cost Reduction Engine"
      title="Cost defense without panic cuts"
    >
      <div className="grid gap-3 md:grid-cols-3">
        {exList<CostMove>(efficiency?.cost_reduction_opportunities).map((item) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.035] p-4" key={item.title}>
            <ExecutionPill label={`${item.risk} risk`} tone={item.risk === "medium" ? "gold" : "cyan"} />
            <p className="mt-3 text-sm font-semibold text-white">{item.title}</p>
            <p className="mt-2 text-xl font-semibold text-cyan-50">{executionMoney.format(item.annual_savings)}</p>
            <p className="mt-1 text-xs text-white/44">annual savings</p>
          </div>
        ))}
      </div>
    </ExecutionPanelChrome>
  );
}
