"use client";

import { useCategoryDomination } from "@/lib/category-domination/use-category-domination";
import { CategoryBar, CategoryMetricCard, CategoryPanelShell } from "@/modules/dashboard/components/category-panel-primitives";

export function CategoryScorePanel() {
  const { score } = useCategoryDomination();
  const value = score?.category_score ?? 96;

  return (
    <CategoryPanelShell
      description="Single dominance meter combining market share, brand authority, trust, benchmarks, analyst posture, government credibility, and narrative control."
      eyebrow="Category Score"
      title={`${value}/100 - ${score?.leadership_label ?? "MARKET LEADER"}`}
      tone="gold"
    >
      <div className="grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="rounded-[28px] border border-amber-200/16 bg-[radial-gradient(circle_at_50%_35%,rgba(245,158,11,0.24),rgba(2,6,23,0.62)_62%)] p-8 text-center">
          <p className="text-[4.5rem] font-semibold leading-none tracking-[-0.08em] text-white">{value}</p>
          <p className="mt-3 text-sm uppercase tracking-[0.24em] text-amber-50/58">{score?.momentum ?? "accelerating"}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <CategoryBar label="Market share" value={score?.market_share_score ?? 92} />
          <CategoryBar label="Brand authority" value={score?.brand_authority_score ?? 89} />
          <CategoryBar label="Trust" value={score?.trust_score ?? 93} />
          <CategoryBar label="Benchmarks" value={score?.benchmark_score ?? 95} />
          <CategoryBar label="Analyst" value={score?.analyst_score ?? 91} />
          <CategoryBar label="Government trust" value={score?.government_trust_score ?? 92} />
          <CategoryBar label="Narrative control" value={score?.narrative_control_score ?? 96} />
          <CategoryMetricCard label="Leadership label" value={score?.leadership_label ?? "MARKET LEADER"} />
        </div>
      </div>
    </CategoryPanelShell>
  );
}

