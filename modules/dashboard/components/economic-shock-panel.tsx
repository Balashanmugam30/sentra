"use client";

import { useOmega } from "@/lib/omega/use-omega";
import { OmegaBar, OmegaMetricCard, OmegaPanelShell, omegaList, omegaNumber, omegaString } from "@/modules/dashboard/components/omega-panel-primitives";

export function EconomicShockPanel() {
  const { economy } = useOmega();
  const shocks = omegaList<Record<string, unknown>>(economy?.shock_paths);

  return (
    <OmegaPanelShell
      description="Global GDP pressure, banking shock probability, inflation wave risk, and trade collapse modeling."
      eyebrow="Economic Shock Grid"
      title={`${omegaNumber(economy?.global_growth_confidence, 81)}% global growth confidence`}
      tone="gold"
    >
      <div className="grid gap-3 md:grid-cols-4">
        <OmegaMetricCard label="Banking shock" value={`${omegaNumber(economy?.banking_shock_probability, 18)}%`} />
        <OmegaMetricCard label="Inflation wave" value={`${omegaNumber(economy?.inflation_wave_risk, 37)}%`} />
        <OmegaMetricCard label="Market confidence" value={`${omegaNumber(economy?.market_confidence, 84)}%`} />
        <OmegaMetricCard label="Trade collapse" value={`${omegaNumber(economy?.trade_collapse_probability, 21)}%`} />
      </div>
      <div className="mt-5 space-y-3">
        {shocks.map((shock, index) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={`${omegaString(shock.shock, "shock")}-${index}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold capitalize text-white">{omegaString(shock.shock, "Shock")}</p>
              <span className="text-xs text-amber-50">{omegaString(shock.impact, "impact modeled")}</span>
            </div>
            <div className="mt-4">
              <OmegaBar label="Probability" value={omegaNumber(shock.probability, 25)} />
            </div>
          </div>
        ))}
      </div>
    </OmegaPanelShell>
  );
}

