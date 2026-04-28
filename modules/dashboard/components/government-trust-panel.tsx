"use client";

import { useCategoryDomination } from "@/lib/category-domination/use-category-domination";
import { CategoryBar, CategoryMetricCard, CategoryPanelShell } from "@/modules/dashboard/components/category-panel-primitives";

export function GovernmentTrustPanel() {
  const { trust } = useCategoryDomination();
  const government = trust?.government;

  return (
    <CategoryPanelShell
      description="Procurement readiness, compliance trust, sovereign fit, defense suitability, and government shortlist strength."
      eyebrow="Government Trust Panel"
      title={`${government?.gov_shortlists ?? 11} government shortlists with ${government?.sovereign_fit ?? 94}% sovereign fit`}
      tone="gold"
    >
      <div className="grid gap-3 md:grid-cols-4">
        <CategoryMetricCard label="Procurement" value={`${government?.procurement_readiness ?? 92}%`} />
        <CategoryMetricCard label="Compliance" value={`${government?.compliance_trust ?? 91}%`} />
        <CategoryMetricCard label="Sovereign fit" value={`${government?.sovereign_fit ?? 94}%`} />
        <CategoryMetricCard label="Defense fit" value={`${government?.defense_suitability ?? 89}%`} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {(government?.badges ?? []).map((badge) => (
          <span className="rounded-full border border-cyan-200/16 bg-cyan-200/8 px-3 py-2 text-xs font-semibold text-cyan-50" key={badge}>
            {badge}
          </span>
        ))}
      </div>
      <div className="mt-4">
        <CategoryBar label="Government trust composite" value={government?.procurement_readiness ?? 92} />
      </div>
    </CategoryPanelShell>
  );
}

