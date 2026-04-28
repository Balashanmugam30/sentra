"use client";

import { useRevenueGrowth } from "@/lib/revenue-growth/use-revenue-growth";
import { RevenueActionButton, RevenueMetricCard, RevenuePanelShell, revenueMoney } from "@/modules/dashboard/components/revenue-panel-primitives";

export function RevenueDominationCenter() {
  const { busyAction, createLead, live, loading, refresh, runGrowthSimulation } = useRevenueGrowth();

  return (
    <RevenuePanelShell
      action={
        <div className="flex flex-wrap gap-2">
          <RevenueActionButton onClick={() => void refresh()}>{loading ? "Syncing..." : "Refresh"}</RevenueActionButton>
          <RevenueActionButton busy={busyAction === "simulation"} onClick={() => void runGrowthSimulation()}>
            {busyAction === "simulation" ? "Simulating..." : "Run Growth Loop"}
          </RevenueActionButton>
          <RevenueActionButton busy={busyAction === "lead"} onClick={() => void createLead()}>
            {busyAction === "lead" ? "Capturing..." : "Capture Lead"}
          </RevenueActionButton>
        </div>
      }
      description="Acquisition, conversion, demo-to-paid, referrals, pricing, viral loops, and authority signals combined into one monetization command layer."
      eyebrow="Revenue Domination OS"
      title={`${revenueMoney.format(live?.arr ?? 822_000)} ARR engine with ${live?.growth_score ?? 93}/100 growth score`}
      tone="gold"
    >
      <div className="grid gap-3 md:grid-cols-5">
        <RevenueMetricCard label="Visitors/mo" note="top of funnel" value={(live?.visitors_month ?? 142_000).toLocaleString()} />
        <RevenueMetricCard label="Leads" note={`${live?.visitor_to_lead ?? 5.8}% visitor-to-lead`} value={(live?.leads ?? 8_240).toLocaleString()} />
        <RevenueMetricCard label="MRR" note="monetized momentum" value={revenueMoney.format(live?.mrr ?? 68_500)} />
        <RevenueMetricCard label="LTV/CAC" note="capital efficient" value={`${live?.ltv_cac ?? 8.1}x`} />
        <RevenueMetricCard label="Best CAC" note="lowest cost channel" value={live?.best_cac_channel ?? "Waitlist"} />
      </div>
    </RevenuePanelShell>
  );
}
