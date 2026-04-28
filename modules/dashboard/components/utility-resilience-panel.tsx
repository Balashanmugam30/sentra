"use client";

import { useCivilizationInfra } from "@/lib/civilization-infra/use-civilization-infra";
import { useGovernment } from "@/lib/government/use-government";
import { CivilizationBar } from "@/modules/dashboard/components/civilization-panel-primitives";
import {
  GovernmentMetricTile,
  GovernmentPanelChrome,
  govList,
  govNumber,
} from "@/modules/dashboard/components/government-panel-primitives";

type InfraAsset = { asset_id: string; name: string; category: string; uptime: number; risk: number; redundancy: number; staffing: number };
type CivilizationUtilityAsset = { name: string; redundancy: number; risk: number; type: string; uptime: number };

export function UtilityResiliencePanel() {
  const { live, infrastructure } = useGovernment();
  const { live: civilizationLive, utilities: civilizationUtilities } = useCivilizationInfra();
  const utilities = govList<InfraAsset>(infrastructure?.assets).filter((asset) =>
    ["Grid Station", "Telecom Tower", "Dam", "Water System"].includes(asset.category),
  );
  const civilizationAssets = civilizationUtilities?.utility_assets ?? [];
  const uptime = civilizationUtilities?.power_uptime ?? govNumber(infrastructure?.average_uptime, 98.8);
  const gridStability = civilizationLive?.power_grid_uptime ?? live?.grid_stability ?? 86;
  const waterPressure = civilizationUtilities?.water_pressure ?? civilizationLive?.water_security_score ?? 91;
  const telecomHealth = civilizationUtilities?.telecom_health ?? live?.continuity_readiness ?? 88;

  return (
    <GovernmentPanelChrome
      description="Utility resilience protects power, water, telecom, dams, fuel reserves, and backup network continuity during compound national crises."
      eyebrow="Utility Resilience"
      title={`${gridStability}% grid stability and ${uptime}% uptime`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <GovernmentMetricTile label="Grid" value={`${gridStability}%`} />
        <GovernmentMetricTile label="Water" value={`${waterPressure}%`} />
        <GovernmentMetricTile label="Telecom" value={`${telecomHealth}%`} />
        <GovernmentMetricTile label="Utility Assets" value={utilities.length + civilizationAssets.length} />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {civilizationAssets.map((asset: CivilizationUtilityAsset) => (
          <div className="rounded-[20px] border border-cyan-200/12 bg-cyan-200/[0.045] p-4" key={`civilization-${asset.name}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{asset.name}</p>
                <p className="mt-1 text-xs text-white/44">{asset.type} / Risk {asset.risk}% / Redundancy {asset.redundancy}%</p>
              </div>
              <span className="rounded-full border border-cyan-200/18 bg-cyan-200/10 px-3 py-1 text-xs font-semibold text-cyan-50">
                {asset.uptime}%
              </span>
            </div>
            <div className="mt-4">
              <CivilizationBar label="Operational uptime" value={asset.uptime} />
            </div>
          </div>
        ))}
        {utilities.map((asset) => (
          <div className="rounded-[20px] border border-white/10 bg-white/[0.035] p-4" key={asset.asset_id}>
            <p className="text-sm font-semibold text-white">{asset.name}</p>
            <p className="mt-1 text-xs text-white/44">{asset.category} / Risk {asset.risk}% / Redundancy {asset.redundancy}%</p>
          </div>
        ))}
      </div>
    </GovernmentPanelChrome>
  );
}
