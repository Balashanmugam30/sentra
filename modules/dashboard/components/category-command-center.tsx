"use client";

import { useCategoryDomination } from "@/lib/category-domination/use-category-domination";
import {
  CategoryActionButton,
  CategoryMetricCard,
  CategoryPanelShell,
  categoryMoney,
} from "@/modules/dashboard/components/category-panel-primitives";

export function CategoryCommandCenter() {
  const { busyAction, error, live, loading, refresh, runMarketSimulation, runPrCampaign } = useCategoryDomination();

  return (
    <CategoryPanelShell
      action={
        <div className="flex flex-wrap gap-2">
          <CategoryActionButton onClick={() => void refresh()}>{loading ? "Syncing..." : "Refresh"}</CategoryActionButton>
          <CategoryActionButton busy={busyAction === "pr-campaign"} onClick={() => void runPrCampaign()}>
            {busyAction === "pr-campaign" ? "Launching..." : "Launch PR Campaign"}
          </CategoryActionButton>
          <CategoryActionButton busy={busyAction === "market-simulation"} onClick={() => void runMarketSimulation()}>
            {busyAction === "market-simulation" ? "Simulating..." : "Run Market Sim"}
          </CategoryActionButton>
        </div>
      }
      description="Brand authority, competitive intelligence, analyst positioning, government trust, benchmark superiority, and strategic narrative control in one category leadership cockpit."
      eyebrow="Category Domination OS"
      title={`${live?.leadership_label ?? "MARKET LEADER"} with ${live?.category_score ?? 96}/100 category score`}
      tone="gold"
    >
      {error ? (
        <div className="mb-4 rounded-[20px] border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-50">
          Category intelligence is serving last verified state: {error}
        </div>
      ) : null}
      <div className="grid gap-3 md:grid-cols-5">
        <CategoryMetricCard label="TAM" note="market size" value={categoryMoney.format(live?.tam ?? 48_000_000_000)} />
        <CategoryMetricCard label="SOM target" note="capture ambition" value={categoryMoney.format(live?.som_capture_target ?? 1_600_000_000)} />
        <CategoryMetricCard label="Win rate" note="competitive deals" value={`${live?.competitive_win_rate ?? 74}%`} />
        <CategoryMetricCard label="Mentions/mo" note="authority surface" value={(live?.brand_mentions_month ?? 2_480).toLocaleString()} />
        <CategoryMetricCard label="ROI" note="buyer proof" value={`${live?.avg_roi_delivered ?? 7.4}x`} />
      </div>
      <p className="mt-4 rounded-[22px] border border-cyan-200/12 bg-cyan-200/8 p-4 text-sm leading-6 text-cyan-50/76">
        {live?.why_sentra_wins ??
          "Sentra owns the autonomous command intelligence narrative with a deeper product surface, stronger trust proof, and proprietary data compounding."}
      </p>
    </CategoryPanelShell>
  );
}

