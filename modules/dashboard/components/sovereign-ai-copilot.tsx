"use client";

import { useGovernment } from "@/lib/government/use-government";
import {
  GovernmentActionButton,
  GovernmentPanelChrome,
  GovernmentPill,
  govList,
  govNumber,
  govString,
} from "@/modules/dashboard/components/government-panel-primitives";

export function SovereignAiCopilot() {
  const { copilot, deployUnits, busyAction } = useGovernment();

  return (
    <GovernmentPanelChrome
      action={
        <GovernmentActionButton disabled={busyAction === "deploy"} onClick={() => void deployUnits()} tone="red">
          Deploy Units
        </GovernmentActionButton>
      }
      description={govString(copilot?.executive_summary, "National readiness is strong, but medical surge and rail redundancy need reinforcement.")}
      eyebrow="Sovereign AI Copilot"
      title={`${govString(copilot?.posture, "sovereign command ready")} with ${govNumber(copilot?.confidence, 91)}% confidence`}
    >
      <div className="rounded-[24px] border border-cyan-200/14 bg-cyan-200/[0.045] p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/52">Next order</p>
        <p className="mt-3 text-lg leading-7 text-white">{govString(copilot?.next_order)}</p>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {govList<string>(copilot?.recommendations).map((item) => (
          <div className="rounded-[18px] border border-white/10 bg-white/[0.035] p-3 text-sm leading-5 text-white/64" key={item}>
            {item}
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <GovernmentPill label="verified channels" />
        <GovernmentPill label="multi-agency" tone="gold" />
        <GovernmentPill label="critical infra first" />
      </div>
    </GovernmentPanelChrome>
  );
}
