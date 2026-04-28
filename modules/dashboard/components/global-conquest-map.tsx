"use client";

import { useMonopolyExpansion } from "@/lib/monopoly-expansion/use-monopoly-expansion";
import { MonopolyBar, MonopolyMetricCard, MonopolyPanelShell } from "@/modules/dashboard/components/monopoly-panel-primitives";

export function GlobalConquestMap() {
  const { conquest } = useMonopolyExpansion();
  const countries = conquest?.country_map ?? [];

  return (
    <MonopolyPanelShell
      description="Country penetration, readiness, legal complexity, channel coverage, and pricing fit for global default-choice expansion."
      eyebrow="Global Conquest Map"
      title={`${conquest?.countries_active ?? 24} countries active, ${conquest?.regions_controlled ?? 9} regions controlled`}
      tone="gold"
    >
      <div className="grid gap-3 md:grid-cols-3">
        <MonopolyMetricCard label="Next country" value={conquest?.next_best_country ?? "Saudi Arabia"} />
        <MonopolyMetricCard label="Regions controlled" value={conquest?.regions_controlled ?? 9} />
        <MonopolyMetricCard label="Strategy" value="Sovereign co-sell" />
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-4">
        {countries.map((country) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={country.country}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">{country.country}</p>
              <span className="rounded-full border border-cyan-200/16 bg-cyan-200/8 px-3 py-1 text-xs font-semibold text-cyan-50">
                {country.entered ? "Entered" : "Next wave"}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              <MonopolyBar label="Readiness" value={country.readiness} />
              <MonopolyBar label="Channel" value={country.channel_coverage} />
              <MonopolyBar label="Pricing" value={country.pricing_fit} />
            </div>
          </div>
        ))}
      </div>
    </MonopolyPanelShell>
  );
}

