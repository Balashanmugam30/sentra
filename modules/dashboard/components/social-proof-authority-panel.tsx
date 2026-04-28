"use client";

import { useRevenueGrowth } from "@/lib/revenue-growth/use-revenue-growth";
import { RevenueBar, RevenueMetricCard, RevenuePanelShell } from "@/modules/dashboard/components/revenue-panel-primitives";

export function SocialProofAuthorityPanel() {
  const { authoritySignals, trustScore } = useRevenueGrowth();

  return (
    <RevenuePanelShell description="Authority signals that reduce buyer risk and increase enterprise conversion trust." eyebrow="Social Proof and Authority" title={`${trustScore || 95}/100 trust signal strength`} tone="gold">
      <RevenueBar label="Trust score" value={trustScore || 95} />
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {authoritySignals.map((signal) => (
          <RevenueMetricCard key={signal.signal_id} label={signal.label} note={signal.impact} value={signal.value.toLocaleString()} />
        ))}
      </div>
    </RevenuePanelShell>
  );
}
