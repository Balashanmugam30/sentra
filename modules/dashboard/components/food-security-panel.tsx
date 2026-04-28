"use client";

import { useCivilizationInfra } from "@/lib/civilization-infra/use-civilization-infra";
import {
  CivilizationBar,
  CivilizationMetricCard,
  CivilizationPanelShell,
} from "@/modules/dashboard/components/civilization-panel-primitives";

const FALLBACK_NODES = [
  { name: "North Cold Chain Spine", reserve_days: 39, risk: 14, route_health: 91 },
  { name: "Metro Grain Reserve", reserve_days: 42, risk: 11, route_health: 94 },
  { name: "Coastal Medicine Food Hub", reserve_days: 33, risk: 18, route_health: 88 },
];

export function FoodSecurityPanel() {
  const { food, live } = useCivilizationInfra();
  const nodes = food?.food_nodes?.length ? food.food_nodes : FALLBACK_NODES;

  return (
    <CivilizationPanelShell
      description="Warehouses, logistics routes, cold-chain health, shortage risk, and reserve-day coverage."
      eyebrow="Food Security Engine"
      title={`${live?.food_reserve_days ?? food?.reserve_days ?? 37} reserve days protected`}
      tone="gold"
    >
      <div className="grid gap-3 md:grid-cols-5">
        <CivilizationMetricCard label="Warehouses" value={food?.warehouses ?? 1_240} />
        <CivilizationMetricCard label="Routes" value={food?.logistics_routes ?? 2_980} />
        <CivilizationMetricCard label="Cold chain" value={`${food?.cold_chain_health ?? 92}%`} />
        <CivilizationMetricCard label="Shortage risk" value={`${food?.shortage_risk ?? 13}%`} />
        <CivilizationMetricCard label="Reserve days" value={food?.reserve_days ?? 37} />
      </div>
      <div className="mt-5 space-y-3">
        {nodes.map((node) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={node.name}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">{node.name}</p>
              <span className="text-xs font-semibold text-amber-50">{node.reserve_days}d reserves</span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <CivilizationBar label="Route health" value={node.route_health} />
              <CivilizationBar label="Risk inverse" value={100 - node.risk} />
            </div>
          </div>
        ))}
      </div>
    </CivilizationPanelShell>
  );
}
