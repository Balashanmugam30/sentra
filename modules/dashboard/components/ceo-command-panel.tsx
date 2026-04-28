"use client";

import { useExecution } from "@/lib/execution/use-execution";
import {
  ExecutionActionButton,
  ExecutionPanelChrome,
  ExecutionPill,
  exList,
  exNumber,
  exRecord,
  exString,
} from "@/modules/dashboard/components/execution-panel-primitives";

export function CeoCommandPanel() {
  const { ceo, runReview, growthMode, costMode, busyAction } = useExecution();
  const plan = exRecord(ceo?.plan_30_60_90);

  return (
    <ExecutionPanelChrome
      action={
        <>
          <ExecutionActionButton disabled={busyAction === "review"} onClick={() => void runReview()} tone="gold">
            Run CEO Review
          </ExecutionActionButton>
          <ExecutionActionButton disabled={busyAction === "growth"} onClick={() => void growthMode()}>
            Aggressive Growth
          </ExecutionActionButton>
          <ExecutionActionButton disabled={busyAction === "cost"} onClick={() => void costMode()} tone="red">
            Cost Defense
          </ExecutionActionButton>
        </>
      }
      description={exString(ceo?.CEO_agent, "Hold pricing power, defend cash, and concentrate expansion through UAE plus partner-led public-sector motion.")}
      eyebrow="CEO AI Command Center"
      title={`${exString(ceo?.operating_posture, "dominant but disciplined")} posture with ${exNumber(ceo?.strategic_confidence_score, 88)}% confidence`}
    >
      <div className="grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[24px] border border-cyan-200/14 bg-cyan-200/[0.045] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/52">Top board priorities</p>
          <div className="mt-3 space-y-2">
            {exList<string>(ceo?.top_board_priorities).map((item) => (
              <p className="rounded-[18px] border border-white/8 bg-white/[0.035] p-3 text-sm leading-5 text-white/66" key={item}>
                {item}
              </p>
            ))}
          </div>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/42">30 / 60 / 90 day plan</p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {(["30_days", "60_days", "90_days"] as const).map((key) => (
              <div className="rounded-[20px] border border-white/10 bg-black/10 p-3" key={key}>
                <ExecutionPill label={key.replace("_", " ")} tone="gold" />
                <div className="mt-3 space-y-2">
                  {exList<string>(plan[key]).map((item) => (
                    <p className="text-xs leading-5 text-white/58" key={item}>
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ExecutionPanelChrome>
  );
}
