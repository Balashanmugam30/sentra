"use client";

import { useExecution } from "@/lib/execution/use-execution";
import {
  ExecutionActionButton,
  ExecutionPanelChrome,
  ExecutionPill,
  exList,
} from "@/modules/dashboard/components/execution-panel-primitives";

type BoardAction = { action_id: string; title: string; upside: string; risk: string; confidence: number; timeline: string };

export function MergerIntegrationPanel() {
  const { board, runSimulation, busyAction } = useExecution();
  const acquisitionActions = exList<BoardAction>(board?.recommended_actions).filter((item) =>
    item.title.toLowerCase().includes("acquisition"),
  );

  return (
    <ExecutionPanelChrome
      action={
        <ExecutionActionButton
          disabled={busyAction === "simulation-Competitor enters market"}
          onClick={() => void runSimulation("Competitor enters market")}
          tone="gold"
        >
          Model Acquisition
        </ExecutionActionButton>
      }
      description="Models acquisition and post-merger integration readiness without distracting the operating company from core expansion."
      eyebrow="M&A Integration"
      title="Acquisition optionality is useful only if distribution accelerates"
    >
      <div className="grid gap-3 md:grid-cols-2">
        {acquisitionActions.map((item) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.035] p-4" key={item.action_id}>
            <ExecutionPill label={`${item.confidence}% confidence`} tone="gold" />
            <p className="mt-3 text-sm font-semibold text-white">{item.title}</p>
            <p className="mt-2 text-sm leading-6 text-cyan-50/60">{item.upside}</p>
            <p className="mt-2 text-xs leading-5 text-orange-50/54">{item.risk}</p>
          </div>
        ))}
      </div>
    </ExecutionPanelChrome>
  );
}
