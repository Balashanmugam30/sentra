"use client";

import { useWorld } from "@/lib/world/use-world";
import {
  WorldPanelChrome,
  WorldPill,
  worldBar,
  worldCurrency,
  worldList,
  worldNumber,
  worldString,
} from "@/modules/dashboard/components/world-panel-primitives";

export function GlobalThreatMatrix() {
  const { threats, live } = useWorld();
  const threatList = worldList<Record<string, unknown>>(threats?.threats ?? live?.top_threats);

  return (
    <WorldPanelChrome title="Global Threat Matrix" eyebrow="Planet-Scale Risk Fusion" accent="red">
      <div className="space-y-3">
        {threatList.slice(0, 7).map((threat, index) => {
          const severity = worldNumber(threat.severity, 70);
          return (
            <article key={`${worldString(threat.name, "threat")}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="font-semibold capitalize text-white">{worldString(threat.name, "Global threat")}</h4>
                <div className="flex gap-2">
                  <WorldPill tone={severity > 75 ? "red" : "gold"}>Severity {severity}</WorldPill>
                  <WorldPill>Prob {worldNumber(threat.probability, 30)}%</WorldPill>
                </div>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-red-300" style={{ width: worldBar(severity) }} />
              </div>
              <p className="mt-3 text-sm text-slate-300">
                Impact {worldCurrency(threat.economic_impact)}. Response: {worldString(threat.recommended_response, "stabilize global posture")}
              </p>
            </article>
          );
        })}
      </div>
    </WorldPanelChrome>
  );
}

