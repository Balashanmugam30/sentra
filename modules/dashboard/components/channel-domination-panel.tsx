"use client";

import { useMonopolyExpansion } from "@/lib/monopoly-expansion/use-monopoly-expansion";
import { MonopolyBar, MonopolyMetricCard, MonopolyPanelShell, monopolyMoney } from "@/modules/dashboard/components/monopoly-panel-primitives";

export function ChannelDominationPanel() {
  const { channel } = useMonopolyExpansion();

  return (
    <MonopolyPanelShell
      description="Reseller revenue, regional distributor coverage, partner-sourced ARR, and procurement channel leverage."
      eyebrow="Channel Domination"
      title={`${channel?.partner_coverage ?? 71}% partner coverage with ${monopolyMoney.format(channel?.procurement_pipeline ?? 24_600_000)} procurement pipeline`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <MonopolyMetricCard label="Reseller revenue" value={monopolyMoney.format(channel?.reseller_revenue ?? 8_400_000)} />
        <MonopolyMetricCard label="Coverage" value={`${channel?.partner_coverage ?? 71}%`} />
        <MonopolyMetricCard label="Pipeline" value={monopolyMoney.format(channel?.procurement_pipeline ?? 24_600_000)} />
        <MonopolyMetricCard label="Distributors" value={channel?.regional_distributors ?? 36} />
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-5">
        {(channel?.coverage_map ?? []).map((region) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={region.region}>
            <p className="text-sm font-semibold text-white">{region.region}</p>
            <p className="mt-1 text-xs text-white/42">{region.top_partner}</p>
            <div className="mt-4">
              <MonopolyBar label="Coverage" value={region.coverage} />
            </div>
          </div>
        ))}
      </div>
    </MonopolyPanelShell>
  );
}

