"use client";

import { useRevenueGrowth } from "@/lib/revenue-growth/use-revenue-growth";
import { RevenueBar, RevenueMetricCard, RevenuePanelShell, revenueMoney } from "@/modules/dashboard/components/revenue-panel-primitives";

export function RevenueGrowthScore() {
  const { live, viral } = useRevenueGrowth();

  return (
    <RevenuePanelShell description="Single monetization readiness score combining acquisition, conversion, pricing, referrals, virality, authority, and capital efficiency." eyebrow="Revenue Growth Score" title={`${live?.growth_score ?? 93}/100 customer acquisition machine`}>
      <RevenueBar label="Growth score" value={live?.growth_score ?? 93} />
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <RevenueMetricCard label="ARR" value={revenueMoney.format(live?.arr ?? 822_000)} />
        <RevenueMetricCard label="Referral revenue" value={revenueMoney.format(live?.referral_revenue ?? 322_000)} />
        <RevenueMetricCard label="Viral coefficient" value={viral?.organic_coefficient ?? live?.viral_coefficient ?? 1.34} />
        <RevenueMetricCard label="Avg CAC" value={revenueMoney.format(live?.avg_cac ?? 118)} />
      </div>
    </RevenuePanelShell>
  );
}
