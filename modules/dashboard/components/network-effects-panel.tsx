"use client";

import { useEcosystem } from "@/lib/ecosystem/use-ecosystem";
import { EcosystemBar, EcosystemMetricCard, EcosystemPanelShell, ecosystemMoney } from "@/modules/dashboard/components/ecosystem-panel-primitives";

export function NetworkEffectsPanel() {
  const { networkEffects } = useEcosystem();

  return (
    <EcosystemPanelShell description="Flywheel measurement across customer invites, retention apps, partner deals, usage expansion, and community referrals." eyebrow="Network Effect Engine" title={`${networkEffects?.moat_score ?? 95}/100 ecosystem moat`} tone="gold">
      <EcosystemBar label="Moat score" value={networkEffects?.moat_score ?? 95} />
      <div className="mt-5 grid gap-3 md:grid-cols-5">
        <EcosystemMetricCard label="Invites" value={(networkEffects?.invites_caused_by_customers ?? 18_400).toLocaleString()} />
        <EcosystemMetricCard label="Retention apps" value={networkEffects?.apps_causing_retention ?? 44} />
        <EcosystemMetricCard label="Partner deals" value={networkEffects?.partners_causing_deals ?? 63} />
        <EcosystemMetricCard label="Expansion" value={ecosystemMoney.format(networkEffects?.usage_causing_expansion ?? 72_000)} />
        <EcosystemMetricCard label="Community refs" value={(networkEffects?.community_referrals ?? 4_820).toLocaleString()} />
      </div>
      <div className="mt-5 grid gap-2 md:grid-cols-5">
        {(networkEffects?.flywheel ?? []).map((step, index) => (
          <div className="rounded-[18px] border border-cyan-200/12 bg-cyan-200/6 p-3 text-xs leading-5 text-cyan-50/70" key={`${step}-${index}`}>
            {index + 1}. {step}
          </div>
        ))}
      </div>
    </EcosystemPanelShell>
  );
}
