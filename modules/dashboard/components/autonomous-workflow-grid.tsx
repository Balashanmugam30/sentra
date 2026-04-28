"use client";

import { useExecution } from "@/lib/execution/use-execution";
import {
  ExecutionPanelChrome,
  ExecutionPill,
  exBar,
  exList,
  exNumber,
  exString,
} from "@/modules/dashboard/components/execution-panel-primitives";

type Workflow = { workflow_id: string; name: string; owner: string; status: string; automation_level: number; steps: number };

export function AutonomousWorkflowGrid() {
  const { workflows } = useExecution();

  return (
    <ExecutionPanelChrome
      description="Autonomous company workflows for launch, hiring, fundraising, cost control, M&A diligence, security hardening, sales blitz, and customer save motion."
      eyebrow="Autonomous Workflow Grid"
      title={`${exNumber(workflows?.active_count, 3)} active workflows with ${exNumber(workflows?.average_automation_level, 76)}% automation`}
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {exList<Workflow>(workflows?.workflows).map((item) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.035] p-4" key={item.workflow_id}>
            <ExecutionPill label={exString(item.status)} tone={item.status === "active" ? "gold" : "cyan"} />
            <p className="mt-3 text-sm font-semibold text-white">{item.name}</p>
            <p className="mt-1 text-xs text-white/42">{item.owner} / {item.steps} steps</p>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-cyan-300/75" style={{ width: exBar(item.automation_level) }} />
            </div>
          </div>
        ))}
      </div>
    </ExecutionPanelChrome>
  );
}
