"use client";

import { useRevenueGrowth } from "@/lib/revenue-growth/use-revenue-growth";
import { RevenueBar, RevenueMetricCard, RevenuePanelShell, revenueMoney } from "@/modules/dashboard/components/revenue-panel-primitives";

export function LeadCaptureEngine() {
  const { leadSources, live } = useRevenueGrowth();
  const maxLeads = Math.max(...leadSources.map((source) => source.leads), 1);

  return (
    <RevenuePanelShell description="Source-level acquisition intelligence for CAC, pipeline quality, and conversion velocity." eyebrow="Lead Capture Engine" title={`Best CAC channel: ${live?.best_cac_channel ?? "Waitlist"}`}>
      <div className="grid gap-3 md:grid-cols-3">
        {leadSources.slice(0, 6).map((source) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={source.source_id}>
            <RevenueBar label={source.name} max={maxLeads} value={source.leads} />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <RevenueMetricCard label="CAC" value={revenueMoney.format(source.cac)} />
              <RevenueMetricCard label="CVR" value={`${source.conversion_rate}%`} />
            </div>
          </div>
        ))}
      </div>
    </RevenuePanelShell>
  );
}
