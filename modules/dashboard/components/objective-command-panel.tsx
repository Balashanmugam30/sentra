"use client";

import { useOmega } from "@/lib/omega/use-omega";
import { OmegaActionButton, OmegaMetricCard, OmegaPanelShell, OmegaPill, omegaList, omegaString } from "@/modules/dashboard/components/omega-panel-primitives";

export function ObjectiveCommandPanel() {
  const { busyAction, objectives, setObjective } = useOmega();
  const available = omegaList<string>(objectives?.available_objectives);
  const active = omegaString(objectives?.active_objective, "maximize safety");

  return (
    <OmegaPanelShell
      description="Human executives set the objective; Omega optimizes the plan while preserving governance and explainability."
      eyebrow="Objective Engine"
      title={`Active objective: ${active}`}
    >
      <div className="grid gap-3 md:grid-cols-3">
        <OmegaMetricCard label="Recommended" value={omegaString(objectives?.recommended_objective, "maximize safety")} />
        <OmegaMetricCard label="Governance" value="Human controlled" />
        <OmegaMetricCard label="Execution mode" value="Approval gated" />
      </div>
      <p className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-white/58">
        {omegaString(objectives?.reason, "Safety objective gives the best blend of trust, continuity, and resilience.")}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {available.map((objective) => (
          <OmegaActionButton busy={busyAction === `objective-${objective}`} key={objective} onClick={() => void setObjective(objective)}>
            {objective === active ? <OmegaPill tone="gold">{objective}</OmegaPill> : objective}
          </OmegaActionButton>
        ))}
      </div>
    </OmegaPanelShell>
  );
}

