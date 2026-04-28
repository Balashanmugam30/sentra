"use client";

import { useGovernment } from "@/lib/government/use-government";
import {
  GovernmentPanelChrome,
  GovernmentPill,
  govList,
} from "@/modules/dashboard/components/government-panel-primitives";

type InfraAsset = { asset_id: string; name: string; category: string; uptime: number; risk: number; redundancy: number; staffing: number };

export function AirportCommandPanel() {
  const { infrastructure } = useGovernment();
  const airports = govList<InfraAsset>(infrastructure?.assets).filter((asset) => asset.category === "Airport");

  return (
    <GovernmentPanelChrome
      description="Airport and transport command focuses on aviation continuity, redundancy, staffing, and protected national travel corridors."
      eyebrow="Airport Command"
      title="National airport continuity protected"
    >
      <div className="grid gap-3 md:grid-cols-2">
        {airports.map((asset) => (
          <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-4" key={asset.asset_id}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-white">{asset.name}</p>
              <GovernmentPill label={`${asset.uptime}% uptime`} tone="gold" />
            </div>
            <p className="mt-3 text-sm text-white/58">Risk {asset.risk}% / Redundancy {asset.redundancy}% / Staffing {asset.staffing}%</p>
          </div>
        ))}
      </div>
    </GovernmentPanelChrome>
  );
}
