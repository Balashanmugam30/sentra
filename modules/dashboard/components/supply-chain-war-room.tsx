"use client";

import { useWorld } from "@/lib/world/use-world";
import {
  WorldMetricTile,
  WorldPanelChrome,
  WorldPill,
  worldList,
  worldNumber,
  worldRecord,
  worldString,
} from "@/modules/dashboard/components/world-panel-primitives";

export function SupplyChainWarRoom() {
  const { supplyChain, live } = useWorld();
  const ports = worldList<Record<string, unknown>>(supplyChain?.ports);
  const lanes = worldList<Record<string, unknown>>(supplyChain?.sea_lanes);
  const airCargo = worldRecord(supplyChain?.air_cargo);

  return (
    <WorldPanelChrome title="Supply Chain War Room" eyebrow="Ports, Air Cargo, Sea Lanes, Rail, Food, Medicine">
      <div className="grid gap-3 md:grid-cols-4">
        <WorldMetricTile label="Chokepoints" value={worldNumber(live?.metrics?.supply_chain_chokepoints, 4)} tone="red" />
        <WorldMetricTile label="Air Capacity" value={worldNumber(airCargo.capacity, 82)} suffix="%" />
        <WorldMetricTile label="Semiconductor Risk" value={worldNumber(supplyChain?.semiconductor_risk, 47)} suffix="%" tone="gold" />
        <WorldMetricTile label="Food Logistics" value={worldNumber(supplyChain?.food_logistics, 39)} suffix="%" />
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
          <h4 className="font-semibold text-white">Ports</h4>
          <div className="mt-3 space-y-2">
            {ports.map((port, index) => (
              <div key={`${worldString(port.name, "port")}-${index}`} className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2 text-sm">
                <span className="text-slate-200">{worldString(port.name, "Port")}</span>
                <WorldPill>{worldString(port.status, "watch")} {worldNumber(port.risk, 20)}</WorldPill>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
          <h4 className="font-semibold text-white">Sea Lanes</h4>
          <div className="mt-3 space-y-2">
            {lanes.map((lane, index) => (
              <p key={`${worldString(lane.lane, "lane")}-${index}`} className="rounded-xl bg-cyan-300/8 px-3 py-2 text-sm text-cyan-50">
                {worldString(lane.lane, "Lane")}: {worldString(lane.recommendation, "monitor")}
              </p>
            ))}
          </div>
        </div>
      </div>
    </WorldPanelChrome>
  );
}
