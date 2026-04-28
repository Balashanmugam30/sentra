"use client";

import { useMonopolyExpansion } from "@/lib/monopoly-expansion/use-monopoly-expansion";
import { MonopolyBar, MonopolyMetricCard, MonopolyPanelShell } from "@/modules/dashboard/components/monopoly-panel-primitives";

export function ProcurementDefaultPanel() {
  const { procurement } = useMonopolyExpansion();

  return (
    <MonopolyPanelShell
      description="Shortlist dominance, preferred vendor rate, RFP invites, repeat bids, and referenceability across strategic enterprise and government segments."
      eyebrow="Procurement Default Engine"
      title={`${procurement?.preferred_vendor_rate ?? 63}% preferred vendor rate across ${(procurement?.rfp_invites ?? 146).toLocaleString()} RFP invites`}
      tone="gold"
    >
      <div className="grid gap-3 md:grid-cols-4">
        <MonopolyMetricCard label="RFP invites" value={(procurement?.rfp_invites ?? 146).toLocaleString()} />
        <MonopolyMetricCard label="Repeat bids" value={procurement?.repeat_bids ?? 58} />
        <MonopolyMetricCard label="Referenceability" value={`${procurement?.referenceability ?? 88}%`} />
        <MonopolyMetricCard label="Motion" value="Trust packet" />
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-5">
        {(procurement?.shortlist_dominance ?? []).map((segment) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={segment.segment}>
            <p className="text-sm font-semibold text-white">{segment.segment}</p>
            <div className="mt-4">
              <MonopolyBar label="Preferred" value={segment.preferred_rate} />
            </div>
          </div>
        ))}
      </div>
    </MonopolyPanelShell>
  );
}

