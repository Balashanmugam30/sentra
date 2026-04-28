"use client";

import { useEcosystem } from "@/lib/ecosystem/use-ecosystem";
import { EcosystemBar, EcosystemMetricCard, EcosystemPanelShell, ecosystemMoney } from "@/modules/dashboard/components/ecosystem-panel-primitives";

export function PlatformMoatScore() {
  const { live, networkEffects } = useEcosystem();

  return (
    <EcosystemPanelShell description="Composite moat score from marketplace density, partner-sourced ARR, API usage, certifications, embedded widgets, and customer-driven invites." eyebrow="Platform Moat Score" title={`${live?.moat_score ?? networkEffects?.moat_score ?? 95}/100 compounding ecosystem advantage`} tone="gold">
      <EcosystemBar label="Moat score" value={live?.moat_score ?? networkEffects?.moat_score ?? 95} />
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <EcosystemMetricCard label="Marketplace ARR" value={ecosystemMoney.format(live?.marketplace_arr ?? 1_800_000)} />
        <EcosystemMetricCard label="Partner ARR" value={ecosystemMoney.format(live?.partner_arr ?? 3_200_000)} />
        <EcosystemMetricCard label="Usage MRR" value={ecosystemMoney.format(live?.usage_revenue_mrr ?? 72_000)} />
        <EcosystemMetricCard label="Training revenue" value={ecosystemMoney.format(live?.training_revenue ?? 410_000)} />
      </div>
    </EcosystemPanelShell>
  );
}
