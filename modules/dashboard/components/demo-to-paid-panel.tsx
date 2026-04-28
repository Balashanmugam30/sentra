"use client";

import { useRevenueGrowth } from "@/lib/revenue-growth/use-revenue-growth";
import { RevenueMetricCard, RevenuePanelShell } from "@/modules/dashboard/components/revenue-panel-primitives";

export function DemoToPaidPanel() {
  const { demoToPaid } = useRevenueGrowth();

  return (
    <RevenuePanelShell description="Tracks how crisis demos convert into proposal motion, paid customers, and enterprise trust." eyebrow="Demo-to-Paid Engine" title={`${demoToPaid?.close_confidence ?? 87}% close confidence after premium demos`}>
      <div className="grid gap-3 md:grid-cols-5">
        <RevenueMetricCard label="Demo views" value={(demoToPaid?.demo_views ?? 18_400).toLocaleString()} />
        <RevenueMetricCard label="Booked" value={(demoToPaid?.demos_booked ?? 780).toLocaleString()} />
        <RevenueMetricCard label="Proposals" value={(demoToPaid?.proposals_sent ?? 286).toLocaleString()} />
        <RevenueMetricCard label="Paid closed" value={(demoToPaid?.paid_closed ?? 418).toLocaleString()} />
        <RevenueMetricCard label="Days to close" value={`${demoToPaid?.avg_days_to_close ?? 19}d`} />
      </div>
      <p className="mt-4 rounded-[20px] border border-cyan-200/12 bg-cyan-200/6 p-4 text-sm text-cyan-50/68">
        Strongest segment: {demoToPaid?.strongest_segment ?? "campus + government continuity teams"}.
      </p>
    </RevenuePanelShell>
  );
}
