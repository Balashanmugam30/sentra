"use client";

import { useExecution } from "@/lib/execution/use-execution";
import {
  ExecutionPanelChrome,
  exBar,
  exList,
  executionMoney,
} from "@/modules/dashboard/components/execution-panel-primitives";

type Allocation = { area: string; percent: number; amount: number };

export function CashAllocationPanel() {
  const { efficiency } = useExecution();
  const allocations = exList<Allocation>(efficiency?.cash_allocation);

  return (
    <ExecutionPanelChrome
      description="CFO-grade capital allocation across growth, AI product, security compliance, and cash reserve."
      eyebrow="Cash Allocation"
      title="Capital deployment stays growth-forward with reserve discipline"
    >
      <div className="grid gap-3 md:grid-cols-2">
        {allocations.map((item) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={item.area}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-white">{item.area}</span>
              <span className="text-cyan-50/70">{item.percent}%</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-cyan-300/75" style={{ width: exBar(item.percent) }} />
            </div>
            <p className="mt-2 text-xs text-white/48">{executionMoney.format(item.amount)}</p>
          </div>
        ))}
      </div>
    </ExecutionPanelChrome>
  );
}
