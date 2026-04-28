"use client";

import { useOmega } from "@/lib/omega/use-omega";
import { OmegaBar, OmegaMetricCard, OmegaPanelShell, omegaList, omegaNumber, omegaRecord, omegaString } from "@/modules/dashboard/components/omega-panel-primitives";

export function CompoundIntelligencePanel() {
  const { aiLive, live } = useOmega();
  const evolution = omegaRecord(aiLive?.evolution);
  const timeline = omegaList<Record<string, unknown>>(evolution.evolution_timeline);

  return (
    <OmegaPanelShell
      description="Measures compounding intelligence from observation, prediction, optimization, and governance."
      eyebrow="Compound Intelligence"
      title={`${live?.metrics?.compound_intelligence_score ?? omegaNumber(evolution.compound_intelligence_score, 99)}/100 score`}
      tone="gold"
    >
      <div className="grid gap-3 md:grid-cols-3">
        <OmegaMetricCard label="Learning gain" value={`+${omegaNumber(evolution.learning_gain_percent, 22)}%`} />
        <OmegaMetricCard label="Recovery improvement" value={`+${omegaNumber(evolution.recovery_improvement_percent, 31)}%`} />
        <OmegaMetricCard label="Trust score" value={`${live?.metrics?.trust_score ?? 91}%`} />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {timeline.map((stage, index) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={`${omegaString(stage.stage, "stage")}-${index}`}>
            <p className="text-sm font-semibold text-white">{omegaString(stage.stage, "Stage")}</p>
            <p className="mt-1 text-xs text-white/50">{omegaString(stage.summary, "improvement summary")}</p>
            <div className="mt-4">
              <OmegaBar label="Gain" value={omegaNumber(stage.gain, 18)} max={40} />
            </div>
          </div>
        ))}
      </div>
    </OmegaPanelShell>
  );
}

