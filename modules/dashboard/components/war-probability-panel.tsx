"use client";

import { useOmega } from "@/lib/omega/use-omega";
import { OmegaBar, OmegaMetricCard, OmegaPanelShell, omegaList, omegaNumber, omegaRecord, omegaString } from "@/modules/dashboard/components/omega-panel-primitives";

export function WarProbabilityPanel() {
  const { threats } = useOmega();
  const geopolitics = omegaRecord(threats?.geopolitics);
  const regions = omegaList<Record<string, unknown>>(geopolitics.risk_regions);

  return (
    <OmegaPanelShell
      description="Geopolitical escalation model with stabilizers and diplomatic safety corridors."
      eyebrow="War Probability"
      title={`${omegaNumber(geopolitics.war_probability_index, 32)}% global escalation probability index`}
      tone="danger"
    >
      <div className="grid gap-3 md:grid-cols-4">
        <OmegaMetricCard label="Risk regions" value={omegaNumber(geopolitics.war_risk_regions, 4)} />
        <OmegaMetricCard label="Sanctions pressure" value={`${omegaNumber(geopolitics.sanctions_pressure, 44)}%`} />
        <OmegaMetricCard label="Civil unrest" value={`${omegaNumber(geopolitics.civil_unrest_index, 38)}%`} />
        <OmegaMetricCard label="Diplomacy" value={`${omegaNumber(geopolitics.diplomatic_stability, 84)}%`} />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {regions.map((region, index) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={`${omegaString(region.region, "region")}-${index}`}>
            <p className="text-sm font-semibold text-white">{omegaString(region.region, "Region")}</p>
            <p className="mt-1 text-xs text-white/50">{omegaString(region.stabilizer, "stabilizer active")}</p>
            <div className="mt-4">
              <OmegaBar label="War probability" value={omegaNumber(region.war_probability, 30)} />
            </div>
          </div>
        ))}
      </div>
    </OmegaPanelShell>
  );
}

