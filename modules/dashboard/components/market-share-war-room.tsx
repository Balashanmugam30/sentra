"use client";

import { useCategoryDomination } from "@/lib/category-domination/use-category-domination";
import {
  CategoryBar,
  CategoryMetricCard,
  CategoryPanelShell,
  categoryMoney,
} from "@/modules/dashboard/components/category-panel-primitives";

export function MarketShareWarRoom() {
  const { marketShare } = useCategoryDomination();
  const regions = marketShare?.region_capture_map ?? [];

  return (
    <CategoryPanelShell
      description="TAM, SAM, SOM, penetration, and regional capture velocity for the command intelligence category."
      eyebrow="Market Share War Room"
      title={`${categoryMoney.format(marketShare?.som_capture_target ?? 1_600_000_000)} SOM capture target with ${(marketShare?.market_capture_velocity ?? 44)}% velocity`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <CategoryMetricCard label="TAM" value={categoryMoney.format(marketShare?.tam ?? 48_000_000_000)} />
        <CategoryMetricCard label="SAM" value={categoryMoney.format(marketShare?.sam ?? 11_200_000_000)} />
        <CategoryMetricCard label="Current penetration" value={`${marketShare?.current_penetration ?? 4.2}%`} />
        <CategoryMetricCard label="Target expansion" value={`${marketShare?.target_expansion_percent ?? 3.3}%`} />
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {regions.map((region) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={region.region}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{region.region}</p>
                <p className="mt-1 text-xs text-white/42">{region.priority}</p>
              </div>
              <span className="rounded-full border border-cyan-200/16 bg-cyan-200/8 px-3 py-1 text-xs font-semibold text-cyan-50">
                +{region.growth_rate}%
              </span>
            </div>
            <div className="mt-4 space-y-3">
              <CategoryBar label="Current capture" value={region.capture} />
              <CategoryBar label="Target capture" value={region.target} />
            </div>
          </div>
        ))}
      </div>
    </CategoryPanelShell>
  );
}

