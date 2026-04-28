"use client";

import { useCategoryDomination } from "@/lib/category-domination/use-category-domination";
import { CategoryBar, CategoryMetricCard, CategoryPanelShell } from "@/modules/dashboard/components/category-panel-primitives";

export function AnalystReportPanel() {
  const { live, trust } = useCategoryDomination();
  const analyst = trust?.analyst;

  return (
    <CategoryPanelShell
      description="Analyst positioning layer showing Sentra as a visionary, outperformer, and category creator."
      eyebrow="Analyst Report Panel"
      title={`${analyst?.rank ?? live?.analyst_rank ?? "Visionary"} positioning with ${analyst?.innovation_class ?? "category creator"} narrative`}
      tone="gold"
    >
      <div className="grid gap-3 md:grid-cols-4">
        <CategoryMetricCard label="Growth class" value={analyst?.growth_class ?? "high growth"} />
        <CategoryMetricCard label="Execution" value={analyst?.execution_class ?? "outperformer"} />
        <CategoryMetricCard label="Position" value="Upper-right" />
        <CategoryMetricCard label="Analyst score" value="91" />
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-5">
        {(analyst?.quadrant ?? []).map((company) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={company.company}>
            <p className="text-sm font-semibold text-white">{company.company}</p>
            <div className="mt-4 space-y-3">
              <CategoryBar label="Vision" value={company.vision} />
              <CategoryBar label="Execution" value={company.execution} />
            </div>
          </div>
        ))}
      </div>
    </CategoryPanelShell>
  );
}

