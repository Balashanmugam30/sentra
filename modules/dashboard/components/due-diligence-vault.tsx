"use client";

import { useInvestor } from "@/lib/investor/use-investor";
import {
  InvestorMetricTile,
  InvestorPanelChrome,
  InvestorStatusPill,
  asList,
  asNumber,
  asString,
} from "@/modules/dashboard/components/investor-panel-primitives";

type DataRoomItem = { item_id: string; name: string; status: string; owner: string };

export function DueDiligenceVault() {
  const { dataroom } = useInvestor();
  const items = asList<DataRoomItem>(dataroom?.items);

  return (
    <InvestorPanelChrome
      description="Tracks the institutional data room across finance, security, legal, IP, customer references, product roadmap, and GTM evidence."
      eyebrow="Due Diligence Vault"
      title={`${asNumber(dataroom?.readiness_percent, 69)}% diligence readiness`}
    >
      <div className="grid gap-3 md:grid-cols-3">
        <InvestorMetricTile label="Ready" value={asNumber(dataroom?.ready_count, 8)} />
        <InvestorMetricTile label="In Progress" value={asNumber(dataroom?.in_progress_count, 4)} />
        <InvestorMetricTile label="Missing" note="must close before growth round" value={asNumber(dataroom?.missing_count, 1)} />
      </div>
      <div className="mt-5 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div className="flex items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-white/[0.035] p-3" key={item.item_id}>
            <div>
              <p className="text-sm font-semibold text-white">{item.name}</p>
              <p className="text-xs text-white/42">{item.owner}</p>
            </div>
            <InvestorStatusPill label={asString(item.status)} tone={item.status === "Missing" ? "red" : item.status === "In Progress" ? "gold" : "cyan"} />
          </div>
        ))}
      </div>
    </InvestorPanelChrome>
  );
}
