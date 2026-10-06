"use client";

import { memo } from "react";

import { formatEta, riskScoreFromStatus } from "@/lib/mobile/helpers";
import type { SystemStatus } from "@/lib/mobile/types";

type MiniMetricsProps = {
  blockedZones: string[];
  eta: number;
  occupancy: number;
  status: SystemStatus;
};

export const MiniMetrics = memo(function MiniMetrics({ blockedZones, eta, occupancy, status }: MiniMetricsProps) {
  const exitsOpen = Math.max(2, 5 - blockedZones.length);
  const metrics = [
    { label: "Occupants", value: occupancy.toString(), detail: "registered on floor telemetry" },
    { label: "Exits Open", value: exitsOpen.toString(), detail: blockedZones.length > 0 ? "one corridor restricted" : "all primary exits verified" },
    { label: "Response ETA", value: formatEta(eta), detail: "route and responder sync" },
    { label: "Risk Score", value: `${riskScoreFromStatus(status)}`, detail: "weighted from live posture" },
  ];

  return (
    <section aria-labelledby="mini-metrics-title">
      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100/60">Live metrics</p>
        <h2 className="mt-1 text-xl font-semibold tracking-[-0.05em] text-white" id="mini-metrics-title">
          Building snapshot
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <article className="rounded-[24px] border border-white/10 bg-white/[0.065] p-4 shadow-[0_20px_54px_rgba(0,0,0,0.18)] backdrop-blur-2xl" key={metric.label}>
            <p className="text-xs text-slate-400">{metric.label}</p>
            <p className="mt-1 text-2xl font-black tracking-[-0.06em] text-white">{metric.value}</p>
            <p className="mt-2 text-[0.7rem] leading-4 text-slate-500">{metric.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
});
