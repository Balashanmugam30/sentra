"use client";

import { useCategoryDomination } from "@/lib/category-domination/use-category-domination";
import { CategoryBar, CategoryMetricCard, CategoryPanelShell, categoryMoney } from "@/modules/dashboard/components/category-panel-primitives";

export function EnterpriseWinPanel() {
  const { trust } = useCategoryDomination();
  const enterprise = trust?.enterprise;

  return (
    <CategoryPanelShell
      description="Closed-won enterprise quality, replacement deals, attach rate, ACV, and vertical proof."
      eyebrow="Enterprise Win Panel"
      title={`${enterprise?.enterprise_wins ?? 42} enterprise wins with ${enterprise?.multi_module_attach_rate ?? 76}% multi-module attach`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <CategoryMetricCard label="ACV" value={categoryMoney.format(enterprise?.average_contract_value ?? 214_000)} />
        <CategoryMetricCard label="Pipeline quality" value={`${enterprise?.pipeline_quality ?? 88}%`} />
        <CategoryMetricCard label="Replacement deals" value={enterprise?.replacement_deals ?? 19} />
        <CategoryMetricCard label="Attach rate" value={`${enterprise?.multi_module_attach_rate ?? 76}%`} />
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-5">
        {(enterprise?.top_verticals ?? []).map((vertical, index) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={vertical}>
            <p className="text-sm font-semibold text-white">{vertical}</p>
            <div className="mt-4">
              <CategoryBar label="Win quality" value={92 - index * 3} />
            </div>
          </div>
        ))}
      </div>
    </CategoryPanelShell>
  );
}

