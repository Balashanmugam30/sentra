"use client";

import { useCategoryDomination } from "@/lib/category-domination/use-category-domination";
import { CategoryBar, CategoryMetricCard, CategoryPanelShell } from "@/modules/dashboard/components/category-panel-primitives";

export function PrMomentumPanel() {
  const { trust } = useCategoryDomination();
  const brand = trust?.brand;

  return (
    <CategoryPanelShell
      description="Media momentum, positive sentiment, authority lift, and market conversation velocity."
      eyebrow="PR Momentum"
      title={`Brand momentum accelerating with ${(brand?.mentions_month ?? 2_480).toLocaleString()} mentions/month`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <CategoryMetricCard label="Mentions" value={(brand?.mentions_month ?? 2_480).toLocaleString()} />
        <CategoryMetricCard label="Positive" value={`${brand?.positive_sentiment ?? 82}%`} />
        <CategoryMetricCard label="Velocity" value={`+${brand?.press_velocity ?? 37}%`} />
        <CategoryMetricCard label="Authority" value={`${brand?.social_authority ?? 84}%`} />
      </div>
      <div className="mt-4 space-y-3 rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
        <CategoryBar label="Media authority" value={brand?.social_authority ?? 84} />
        <CategoryBar label="Thought leadership" value={brand?.thought_leadership_score ?? 89} />
        <CategoryBar label="Sentiment quality" value={brand?.positive_sentiment ?? 82} />
      </div>
    </CategoryPanelShell>
  );
}

