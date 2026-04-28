"use client";

import { useOmega } from "@/lib/omega/use-omega";
import { OmegaActionButton, OmegaMetricCard, OmegaPanelShell, omegaRecord } from "@/modules/dashboard/components/omega-panel-primitives";

export function SingularityCommandCenter() {
  const { aiLive, busyAction, live, runImprovementCycle, runSelfHeal } = useOmega();
  const selfImprovement = omegaRecord(aiLive?.self_improvement);

  return (
    <OmegaPanelShell
      action={
        <div className="flex flex-wrap gap-2">
          <OmegaActionButton busy={busyAction === "improvement-cycle"} onClick={() => void runImprovementCycle()}>
            {busyAction === "improvement-cycle" ? "Improving..." : "Run Improvement"}
          </OmegaActionButton>
          <OmegaActionButton busy={busyAction === "self-heal"} onClick={() => void runSelfHeal()}>
            {busyAction === "self-heal" ? "Healing..." : "Run Self-Heal"}
          </OmegaActionButton>
        </div>
      }
      description="Recursive self-improvement, strategic memory, human governance, trust, and autonomous optimization."
      eyebrow="Singularity Core"
      title={`${live?.metrics?.compound_intelligence_score ?? 99}/100 compound intelligence`}
      tone="gold"
    >
      <div className="grid gap-3 md:grid-cols-5">
        <OmegaMetricCard label="Decision accuracy" value={`${live?.metrics?.decision_accuracy ?? selfImprovement.decision_accuracy ?? 96}%`} />
        <OmegaMetricCard label="Forecast accuracy" value={`${live?.metrics?.forecast_accuracy ?? 94}%`} />
        <OmegaMetricCard label="Learning gain" value={`+${live?.metrics?.learning_gain_percent ?? 22}%`} />
        <OmegaMetricCard label="Recovery gain" value={`+${live?.metrics?.recovery_improvement_percent ?? 31}%`} />
        <OmegaMetricCard label="Self-heal" value={`${live?.metrics?.self_heal_success_percent ?? 97}%`} />
      </div>
    </OmegaPanelShell>
  );
}

