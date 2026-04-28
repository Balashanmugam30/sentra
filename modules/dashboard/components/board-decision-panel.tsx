"use client";

import { useExecution } from "@/lib/execution/use-execution";
import {
  ExecutionPanelChrome,
  ExecutionPill,
  exList,
  exNumber,
  exRecord,
  exString,
  executionMoney,
} from "@/modules/dashboard/components/execution-panel-primitives";

type BoardAction = { action_id: string; title: string; upside: string; risk: string; cost: number; confidence: number; timeline: string };

export function BoardDecisionPanel() {
  const { board } = useExecution();
  const topVote = exRecord(board?.top_vote);

  return (
    <ExecutionPanelChrome
      action={<ExecutionPill label={exString(board?.decision_posture, "approve growth with CFO guardrails")} tone="gold" />}
      description="Board-grade actions include upside, risk, cost, confidence, and timeline for high-stakes company decisions."
      eyebrow="Board Decision Engine"
      title={`Board readiness ${exNumber(board?.board_readiness, 93)}% - top vote: ${exString(topVote.title, "Prepare Series C narrative")}`}
    >
      <div className="grid gap-3 xl:grid-cols-2">
        {exList<BoardAction>(board?.recommended_actions).map((item) => (
          <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-4" key={item.action_id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <ExecutionPill label={`${item.confidence}% confidence`} tone="gold" />
              <span className="text-xs text-white/44">{item.timeline}</span>
            </div>
            <p className="mt-3 text-lg font-semibold tracking-[-0.03em] text-white">{item.title}</p>
            <p className="mt-2 text-sm leading-6 text-cyan-50/62">{item.upside}</p>
            <p className="mt-2 text-sm leading-6 text-orange-50/56">{item.risk}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-white/40">Cost {executionMoney.format(item.cost)}</p>
          </div>
        ))}
      </div>
    </ExecutionPanelChrome>
  );
}
