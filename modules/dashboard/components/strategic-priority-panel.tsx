"use client";

import { useExecution } from "@/lib/execution/use-execution";
import {
  ExecutionPanelChrome,
  ExecutionPill,
  exList,
  exString,
} from "@/modules/dashboard/components/execution-panel-primitives";

export function StrategicPriorityPanel() {
  const { ceo } = useExecution();

  return (
    <ExecutionPanelChrome
      description={exString(ceo?.revenue_trajectory, "triple-digit growth with global GTM leverage")}
      eyebrow="Strategic Priority Panel"
      title="Top 5 board priorities converted into execution posture"
    >
      <div className="grid gap-3 md:grid-cols-2">
        {exList<string>(ceo?.top_board_priorities).map((item, index) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={item}>
            <ExecutionPill label={`Priority ${index + 1}`} tone={index < 2 ? "gold" : "cyan"} />
            <p className="mt-3 text-sm leading-6 text-white/66">{item}</p>
          </div>
        ))}
      </div>
    </ExecutionPanelChrome>
  );
}
