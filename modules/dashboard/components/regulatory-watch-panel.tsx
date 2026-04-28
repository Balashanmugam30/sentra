"use client";

import { useMonopolyExpansion } from "@/lib/monopoly-expansion/use-monopoly-expansion";
import { MonopolyBar, MonopolyMetricCard, MonopolyPanelShell } from "@/modules/dashboard/components/monopoly-panel-primitives";

export function RegulatoryWatchPanel() {
  const { regulatory } = useMonopolyExpansion();

  return (
    <MonopolyPanelShell
      description="Antitrust, public trust, compliance, procurement fairness, data portability, and interoperability guardrails for responsible market power."
      eyebrow="Regulatory Watch"
      title={`Regulatory risk ${regulatory?.antitrust_risk ?? "moderate-low"} with ${regulatory?.public_trust_score ?? 88}/100 public trust`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <MonopolyMetricCard label="Compliance" value={`${regulatory?.compliance_posture ?? 92}%`} />
        <MonopolyMetricCard label="Fair procurement" value={`${regulatory?.procurement_fairness ?? 91}%`} />
        <MonopolyMetricCard label="Portability" value={`${regulatory?.data_portability ?? 86}%`} />
        <MonopolyMetricCard label="Interop" value={`${regulatory?.interoperability_score ?? 89}%`} />
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {(regulatory?.risk_register ?? []).map((risk) => (
          <article className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={risk.risk}>
            <p className="text-sm font-semibold text-white">{risk.risk}</p>
            <p className="mt-1 text-xs text-amber-50/55">{risk.severity}</p>
            <p className="mt-3 text-sm leading-6 text-white/58">{risk.mitigation}</p>
          </article>
        ))}
      </div>
      <div className="mt-4">
        <MonopolyBar label="Responsible expansion health" value={regulatory?.public_trust_score ?? 88} />
      </div>
    </MonopolyPanelShell>
  );
}

