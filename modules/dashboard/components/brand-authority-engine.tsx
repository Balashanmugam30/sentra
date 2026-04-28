"use client";

import { useCategoryDomination } from "@/lib/category-domination/use-category-domination";
import {
  CategoryActionButton,
  CategoryBar,
  CategoryMetricCard,
  CategoryPanelShell,
} from "@/modules/dashboard/components/category-panel-primitives";

export function BrandAuthorityEngine() {
  const { busyAction, runPrCampaign, trust } = useCategoryDomination();
  const brand = trust?.brand;

  return (
    <CategoryPanelShell
      action={
        <CategoryActionButton busy={busyAction === "pr-campaign"} onClick={() => void runPrCampaign()}>
          {busyAction === "pr-campaign" ? "Launching..." : "Launch Authority Campaign"}
        </CategoryActionButton>
      }
      description="PR momentum, thought leadership, social authority, and influence graph for category narrative ownership."
      eyebrow="Brand Authority Engine"
      title={`${(brand?.mentions_month ?? 2_480).toLocaleString()} monthly mentions at ${brand?.positive_sentiment ?? 82}% positive sentiment`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <CategoryMetricCard label="Thought leadership" value={`${brand?.thought_leadership_score ?? 89}%`} />
        <CategoryMetricCard label="Social authority" value={`${brand?.social_authority ?? 84}%`} />
        <CategoryMetricCard label="Press velocity" value={`+${brand?.press_velocity ?? 37}%`} />
        <CategoryMetricCard label="Sentiment" value={`${brand?.positive_sentiment ?? 82}%`} />
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-5">
        {(brand?.influence_graph ?? []).map((node) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={node.node}>
            <p className="text-sm font-semibold text-white">{node.node}</p>
            <div className="mt-4">
              <CategoryBar label="Influence" value={node.influence} />
            </div>
          </div>
        ))}
      </div>
    </CategoryPanelShell>
  );
}

