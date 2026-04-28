"use client";

import { useOmega } from "@/lib/omega/use-omega";
import { OmegaBar, OmegaMetricCard, OmegaPanelShell, omegaList, omegaNumber, omegaRecord, omegaString } from "@/modules/dashboard/components/omega-panel-primitives";

export function CivilizationResiliencePanel() {
  const { civilization, live } = useOmega();
  const civ = omegaRecord(civilization?.civilization);
  const factors = omegaList<Record<string, unknown>>(civ.continuity_factors);

  return (
    <OmegaPanelShell
      description="Civilization continuity across economy, conflict, health, energy, climate, logistics, trust, and governance."
      eyebrow="Civilization Resilience"
      title={`${live?.metrics?.civilization_resilience ?? omegaNumber(civ.civilization_resilience, 93)}% civilization resilience`}
      tone="gold"
    >
      <div className="grid gap-3 md:grid-cols-4">
        <OmegaMetricCard label="Global stability" value={`${live?.metrics?.global_stability ?? omegaNumber(civ.global_stability, 88)}%`} />
        <OmegaMetricCard label="Compound score" value={`${live?.metrics?.compound_intelligence_score ?? omegaNumber(civ.compound_intelligence_score, 99)}/100`} />
        <OmegaMetricCard label="Continuity status" value={omegaString(omegaRecord(civilization?.continuity).continuity_status, "dominant-stable")} />
        <OmegaMetricCard label="Recovery ETA" value={`${omegaNumber(omegaRecord(civilization?.continuity).recovery_eta_minutes, 18)}m`} />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {factors.map((factor, index) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={`${omegaString(factor.factor, "factor")}-${index}`}>
            <OmegaBar label={omegaString(factor.factor, "Continuity factor")} value={omegaNumber(factor.score, 86)} />
          </div>
        ))}
      </div>
    </OmegaPanelShell>
  );
}

