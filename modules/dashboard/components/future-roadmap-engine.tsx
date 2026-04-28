"use client";

import { useExecution } from "@/lib/execution/use-execution";
import {
  ExecutionPanelChrome,
  ExecutionPill,
  exList,
  exRecord,
} from "@/modules/dashboard/components/execution-panel-primitives";

export function FutureRoadmapEngine() {
  const { ceo } = useExecution();
  const plan = exRecord(ceo?.plan_30_60_90);

  return (
    <ExecutionPanelChrome
      description="Converts strategic board priorities into sequenced 30, 60, and 90 day execution paths."
      eyebrow="Future Roadmap Engine"
      title="Execution timeline is staged around UAE, security evidence, and GTM repeatability"
    >
      <div className="grid gap-3 md:grid-cols-3">
        {(["30_days", "60_days", "90_days"] as const).map((key) => (
          <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-4" key={key}>
            <ExecutionPill label={key.replace("_", " ")} tone="gold" />
            <div className="mt-4 space-y-3">
              {exList<string>(plan[key]).map((item) => (
                <div className="rounded-[18px] border border-white/8 bg-black/10 p-3 text-sm leading-5 text-white/64" key={item}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ExecutionPanelChrome>
  );
}
