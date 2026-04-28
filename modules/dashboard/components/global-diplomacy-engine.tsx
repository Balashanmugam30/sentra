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

export function GlobalDiplomacyEngine() {
  const { diplomacy, live } = useWorld();
  const alliances = worldList<Record<string, unknown>>(diplomacy?.alliances);
  const deals = worldList<Record<string, unknown>>(diplomacy?.trade_recovery_deals);
  const sanctions = worldRecord(diplomacy?.sanctions_impact);

  return (
    <WorldPanelChrome title="Global Diplomacy Engine" eyebrow="AI Diplomacy + Trade Recovery + Peace Corridors" accent="gold">
      <div className="grid gap-3 md:grid-cols-4">
        <WorldMetricTile label="Diplomacy Index" value={worldNumber(live?.metrics?.diplomacy_index, 86)} suffix="%" tone="gold" />
        <WorldMetricTile label="Sanctions Risk" value={worldNumber(sanctions.risk, 29)} suffix="%" />
        <WorldMetricTile label="Alliances" value={alliances.length || 3} />
        <WorldMetricTile label="Peace Corridors" value={worldList(diplomacy?.peace_corridors).length || 2} />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {alliances.map((alliance, index) => (
          <article key={`${worldString(alliance.bloc, "alliance")}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-semibold text-white">{worldString(alliance.bloc, "Alliance")}</h4>
              <WorldPill>{worldNumber(alliance.strength, 85)}%</WorldPill>
            </div>
            <p className="mt-2 text-sm text-slate-300">{worldString(alliance.opportunity, "stabilization opportunity")}</p>
          </article>
        ))}
      </div>
      <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
        <h4 className="font-semibold text-amber-100">Trade Recovery Deals</h4>
        <div className="mt-3 flex flex-wrap gap-2">
          {deals.map((deal, index) => (
            <WorldPill key={`${worldString(deal.deal, "deal")}-${index}`} tone="gold">
              {worldString(deal.deal, "Recovery deal")} +{worldNumber(deal.stability_gain, 7)}
            </WorldPill>
          ))}
        </div>
      </div>
    </WorldPanelChrome>
  );
}

