"use client";

import { useEcosystem } from "@/lib/ecosystem/use-ecosystem";
import {
  EcosystemActionButton,
  EcosystemBar,
  EcosystemMetricCard,
  EcosystemPanelShell,
  ecosystemMoney,
} from "@/modules/dashboard/components/ecosystem-panel-primitives";

export function PartnerNetworkPanel() {
  const { busyAction, launchPartner, partners } = useEcosystem();
  const maxPipeline = Math.max(...partners.map((partner) => partner.pipeline), 1);

  return (
    <EcosystemPanelShell
      action={
        <EcosystemActionButton busy={busyAction === "partner"} onClick={() => void launchPartner()}>
          {busyAction === "partner" ? "Launching..." : "Launch Partner"}
        </EcosystemActionButton>
      }
      description="Reseller, integrator, OEM, government SI, regional channel, and affiliate network performance."
      eyebrow="Partner Network"
      title="Channel partners are becoming a distribution moat"
      tone="gold"
    >
      <div className="grid gap-3 lg:grid-cols-2">
        {partners.slice(0, 6).map((partner) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={partner.partner_id}>
            <p className="text-sm font-semibold text-white">{partner.name}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-cyan-50/45">{partner.partner_type}</p>
            <div className="mt-4">
              <EcosystemBar label="Partner pipeline" max={maxPipeline} value={partner.pipeline} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <EcosystemMetricCard label="ARR" value={ecosystemMoney.format(partner.sourced_arr)} />
              <EcosystemMetricCard label="Close" value={`${partner.close_rate}%`} />
              <EcosystemMetricCard label="Country" value={partner.top_country} />
            </div>
          </div>
        ))}
      </div>
    </EcosystemPanelShell>
  );
}
