"use client";

import { useMonopolyExpansion } from "@/lib/monopoly-expansion/use-monopoly-expansion";
import { MonopolyBar, MonopolyPanelShell, monopolyMoney } from "@/modules/dashboard/components/monopoly-panel-primitives";

export function StrategicPartnershipGrid() {
  const { partners } = useMonopolyExpansion();

  return (
    <MonopolyPanelShell
      description="Cloud, government, telecom, integrator, defense, and university partnerships that turn distribution into a moat."
      eyebrow="Strategic Partnership Grid"
      title={`${partners.length || 5} high-value alliances expanding procurement reach`}
    >
      <div className="grid gap-3 lg:grid-cols-5">
        {partners.map((partner) => (
          <article className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={partner.name}>
            <p className="text-sm font-semibold text-white">{partner.name}</p>
            <p className="mt-1 text-xs text-white/42">{partner.type} - {partner.status}</p>
            <p className="mt-3 text-xs text-cyan-50/58">{monopolyMoney.format(partner.revenue_potential)} potential</p>
            <div className="mt-4 space-y-3">
              <MonopolyBar label="Reach" value={partner.reach_score} />
              <MonopolyBar label="Trust lift" value={partner.trust_lift} />
            </div>
          </article>
        ))}
      </div>
    </MonopolyPanelShell>
  );
}

