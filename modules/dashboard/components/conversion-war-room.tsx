"use client";

import { useRevenueGrowth } from "@/lib/revenue-growth/use-revenue-growth";
import { RevenueBar, RevenuePanelShell } from "@/modules/dashboard/components/revenue-panel-primitives";

export function ConversionWarRoom() {
  const { conversionMetrics } = useRevenueGrowth();

  return (
    <RevenuePanelShell description="Conversion bottlenecks, benchmarks, and AI guidance for every monetization step." eyebrow="Conversion War Room" title="Revenue leaks are visible before they become missed ARR">
      <div className="grid gap-3 lg:grid-cols-2">
        {conversionMetrics.map((metric) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={metric.metric_id}>
            <RevenueBar label={`${metric.label} (${metric.unit})`} max={Math.max(metric.benchmark, metric.value, 1)} value={metric.value} />
            <p className="mt-3 text-sm leading-6 text-white/58">{metric.recommendation}</p>
          </div>
        ))}
      </div>
    </RevenuePanelShell>
  );
}
