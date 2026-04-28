"use client";

import { useGovernment } from "@/lib/government/use-government";
import {
  GovernmentMetricTile,
  GovernmentPanelChrome,
  GovernmentPill,
  govList,
  govNumber,
  govString,
} from "@/modules/dashboard/components/government-panel-primitives";

type DefenseAlert = { zone: string; severity: string; confidence: number };

export function DefenseGridPanel() {
  const { defense } = useGovernment();

  return (
    <GovernmentPanelChrome
      action={<GovernmentPill label={govString(defense?.defense_posture, "guarded")} tone="gold" />}
      description="Defense grid monitors airspace alerts, naval zones, ground movement, strategic assets, radar confidence, and ranked threats."
      eyebrow="Defense Grid"
      title={`${govNumber(defense?.radar_confidence, 88)}% radar confidence across strategic grid`}
    >
      <div className="grid gap-3 md:grid-cols-3">
        <GovernmentMetricTile label="Airspace Alerts" value={govList<DefenseAlert>(defense?.airspace_alerts).length || 2} />
        <GovernmentMetricTile label="Naval Alerts" value={govList<DefenseAlert>(defense?.naval_zone_alerts).length || 2} />
        <GovernmentMetricTile label="Threat Rank" value={govList<string>(defense?.threat_ranking)[0] ?? "drone intrusion"} />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {[...govList<DefenseAlert>(defense?.airspace_alerts), ...govList<DefenseAlert>(defense?.naval_zone_alerts)].map((item) => (
          <div className="rounded-[20px] border border-white/10 bg-white/[0.035] p-4" key={`${item.zone}-${item.severity}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">{item.zone}</p>
              <GovernmentPill label={item.severity} tone={item.severity === "elevated" ? "red" : "gold"} />
            </div>
            <p className="mt-2 text-xs text-cyan-50/58">{item.confidence}% confidence</p>
          </div>
        ))}
      </div>
    </GovernmentPanelChrome>
  );
}
