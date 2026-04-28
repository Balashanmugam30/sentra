"use client";

import { useGovernment } from "@/lib/government/use-government";
import {
  GovernmentMetricTile,
  GovernmentPanelChrome,
  GovernmentPill,
  govBar,
  govList,
  govNumber,
  govString,
} from "@/modules/dashboard/components/government-panel-primitives";

export function NationalReadinessPanel() {
  const { readiness } = useGovernment();

  const scores = [
    ["Country", readiness?.country_readiness_score, 89],
    ["State", readiness?.state_readiness_score, 87],
    ["Emergency", readiness?.emergency_response_capability, 88],
    ["Cyber", readiness?.cyber_resilience_score, 92],
    ["Medical", readiness?.medical_readiness, 81],
    ["Comms", readiness?.communications_continuity, 90],
    ["Border", readiness?.border_integrity_score, 86],
  ] as const;

  return (
    <GovernmentPanelChrome
      action={<GovernmentPill label={govString(readiness?.readiness_class, "Sovereign Ready")} tone="gold" />}
      description="National readiness fuses emergency response, cyber resilience, medical surge, infrastructure risk, reserves, communications, and border integrity."
      eyebrow="National Readiness Engine"
      title={`${govNumber(readiness?.country_readiness_score, 89)}/100 sovereign readiness`}
    >
      <div className="grid gap-3 md:grid-cols-3">
        <GovernmentMetricTile label="Supply Reserve" note="days" value={govNumber(readiness?.supply_reserve_days, 41)} />
        <GovernmentMetricTile label="Infrastructure Risk" note="lower is better" value={`${govNumber(readiness?.infrastructure_risk, 24)}%`} />
        <GovernmentMetricTile label="Border Integrity" value={`${govNumber(readiness?.border_integrity_score, 86)}%`} />
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_0.8fr]">
        <div className="space-y-3 rounded-[24px] border border-white/10 bg-white/[0.035] p-4">
          {scores.map(([label, value, fallback]) => (
            <div key={label}>
              <div className="flex items-center justify-between text-xs text-white/54">
                <span>{label}</span>
                <span>{govNumber(value, fallback)}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-cyan-300/75" style={{ width: govBar(value, fallback) }} />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-[24px] border border-amber-200/14 bg-amber-200/[0.055] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-amber-100/54">Weak links</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {govList<string>(readiness?.weak_links).map((item) => (
              <GovernmentPill key={item} label={item} tone="gold" />
            ))}
          </div>
        </div>
      </div>
    </GovernmentPanelChrome>
  );
}
