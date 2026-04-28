"use client";

import { useExecution } from "@/lib/execution/use-execution";
import {
  ExecutionActionButton,
  ExecutionPanelChrome,
  ExecutionPill,
  exList,
  exNumber,
  exString,
} from "@/modules/dashboard/components/execution-panel-primitives";

type AgentPosition = { agent: string; position: string; score: number };

export function AiExecutiveCouncil() {
  const { council, runReview, busyAction } = useExecution();

  return (
    <ExecutionPanelChrome
      action={
        <ExecutionActionButton disabled={busyAction === "review"} onClick={() => void runReview()} tone="gold">
          Run Council
        </ExecutionActionButton>
      }
      description="CEO, CFO, COO, CRO, CHRO, and CISO agents debate strategy and converge on one board-safe recommendation."
      eyebrow="Autonomous Executive Council"
      title={`${exNumber(council?.consensus_percent, 87)}% consensus with ${exNumber(council?.confidence, 88)}% confidence`}
    >
      <div className="rounded-[24px] border border-cyan-200/14 bg-cyan-200/[0.045] p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/52">Final recommendation</p>
        <p className="mt-3 text-lg leading-7 text-white">{exString(council?.final_recommendation)}</p>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {exList<AgentPosition>(council?.agents).map((item) => (
          <div className="rounded-[20px] border border-white/10 bg-white/[0.035] p-4" key={item.agent}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">{item.agent}</p>
              <ExecutionPill label={`${item.score}`} />
            </div>
            <p className="mt-3 text-sm leading-6 text-white/58">{item.position}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {exList<string>(council?.disagreements).map((item) => (
          <ExecutionPill key={item} label={item} tone="gold" />
        ))}
      </div>
    </ExecutionPanelChrome>
  );
}
