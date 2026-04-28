"use client";

import { useCategoryDomination } from "@/lib/category-domination/use-category-domination";
import { CategoryBar, CategoryMetricCard, CategoryPanelShell } from "@/modules/dashboard/components/category-panel-primitives";

export function BenchmarkSuperiorityPanel() {
  const { benchmark } = useCategoryDomination();

  return (
    <CategoryPanelShell
      description="Benchmark proof comparing Sentra against category alternatives across speed, cost savings, AI accuracy, ROI, and platform depth."
      eyebrow="Benchmark Superiority"
      title={`${benchmark?.avg_roi_delivered ?? 7.4}x ROI, +${benchmark?.ai_accuracy_advantage ?? 19}% AI accuracy, +${benchmark?.operational_speed_gain ?? 44}% operational speed`}
      tone="gold"
    >
      <div className="grid gap-3 md:grid-cols-4">
        <CategoryMetricCard label="Cost savings" value={`+${benchmark?.cost_savings ?? 32}%`} />
        <CategoryMetricCard label="Response gain" value={`+${benchmark?.response_time_gain ?? 51}%`} />
        <CategoryMetricCard label="Platform depth" value={`+${benchmark?.platform_depth_advantage ?? 46}%`} />
        <CategoryMetricCard label="ROI" value={`${benchmark?.avg_roi_delivered ?? 7.4}x`} />
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {(benchmark?.comparisons ?? []).map((comparison) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={comparison.metric}>
            <p className="text-sm font-semibold text-white">{comparison.metric}</p>
            <div className="mt-4 space-y-3">
              <CategoryBar label={`Sentra (${comparison.unit})`} max={comparison.metric === "ROI delivered" ? 10 : 100} value={comparison.sentra} />
              <CategoryBar label={`Competitor avg (${comparison.unit})`} max={comparison.metric === "ROI delivered" ? 10 : 100} value={comparison.competitor_average} />
            </div>
          </div>
        ))}
      </div>
    </CategoryPanelShell>
  );
}

