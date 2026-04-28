"use client";

import { useCivilizationInfra } from "@/lib/civilization-infra/use-civilization-infra";
import { CivilizationBar, CivilizationMetricCard, CivilizationPanelShell } from "@/modules/dashboard/components/civilization-panel-primitives";

export function CivilizationScorePanel() {
  const { score } = useCivilizationInfra();
  const value = score?.civilization_score ?? 98;

  return (
    <CivilizationPanelShell
      description="Single resilience score across national grids, megacities, utilities, transport, healthcare, education, food, water, disasters, and continuity backbone."
      eyebrow="Civilization Score"
      title={`${value}/100 - ${score?.label ?? "ESSENTIAL GLOBAL BACKBONE"}`}
      tone="gold"
    >
      <div className="grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="rounded-[28px] border border-amber-200/16 bg-[radial-gradient(circle_at_50%_35%,rgba(245,158,11,0.24),rgba(2,6,23,0.62)_62%)] p-8 text-center">
          <p className="text-[4.5rem] font-semibold leading-none tracking-[-0.08em] text-white">{value}</p>
          <p className="mt-3 text-sm uppercase tracking-[0.24em] text-amber-50/58">{score?.label ?? "ESSENTIAL GLOBAL BACKBONE"}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <CivilizationBar label="National grid" value={score?.national_grid_score ?? 94} />
          <CivilizationBar label="Mega city" value={score?.mega_city_score ?? 92} />
          <CivilizationBar label="Utilities" value={score?.utility_resilience_score ?? 93} />
          <CivilizationBar label="Transport" value={score?.transport_score ?? 91} />
          <CivilizationBar label="Healthcare" value={score?.healthcare_score ?? 89} />
          <CivilizationBar label="Disaster prediction" value={score?.disaster_prediction_score ?? 94} />
          <CivilizationBar label="Continuity" value={score?.continuity_backbone_score ?? 96} />
          <CivilizationMetricCard label="Backbone state" value="Indispensable" />
        </div>
      </div>
    </CivilizationPanelShell>
  );
}

