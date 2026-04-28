"use client";

import { useGovernment } from "@/lib/government/use-government";
import {
  GovernmentMetricTile,
  GovernmentPanelChrome,
  govList,
  govNumber,
} from "@/modules/dashboard/components/government-panel-primitives";

type InfraAsset = {
  asset_id: string;
  name: string;
  category: string;
  uptime: number;
  risk: number;
  redundancy: number;
  staffing: number;
  incidents: number;
};

export function CriticalInfraPanel() {
  const { infrastructure } = useGovernment();

  return (
    <GovernmentPanelChrome
      description="Critical infrastructure OS covers airports, ports, railways, grid stations, telecom towers, hospitals, universities, dams, and water systems."
      eyebrow="Critical Infrastructure OS"
      title={`${govNumber(infrastructure?.average_uptime, 98.8)}% average uptime with ${govNumber(infrastructure?.average_risk, 22)}% average risk`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <GovernmentMetricTile label="Airports" value={govNumber(infrastructure?.airports_protected, 14)} />
        <GovernmentMetricTile label="Ports" value={govNumber(infrastructure?.ports_protected, 7)} />
        <GovernmentMetricTile label="Grid Stability" value={`${govNumber(infrastructure?.grid_stability, 86)}%`} />
        <GovernmentMetricTile label="Priority Repairs" value={govList<string>(infrastructure?.priority_repairs).length || 3} />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {govList<InfraAsset>(infrastructure?.assets).map((asset) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.035] p-4" key={asset.asset_id}>
            <p className="text-sm font-semibold text-white">{asset.name}</p>
            <p className="mt-1 text-xs text-cyan-50/50">{asset.category}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/50">
              <span>Uptime {asset.uptime}%</span>
              <span>Risk {asset.risk}%</span>
              <span>Redundancy {asset.redundancy}%</span>
              <span>Incidents {asset.incidents}</span>
            </div>
          </div>
        ))}
      </div>
    </GovernmentPanelChrome>
  );
}
