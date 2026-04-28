"use client";

import { memo } from "react";

import { STATUS_COPY } from "../../lib/mobile/constants";
import { cn, formatEta, formatLastSync, riskScoreFromStatus, statusTone } from "../../lib/mobile/helpers";
import type { SystemStatus } from "../../lib/mobile/types";
import { GlassCard } from "./glass-card";
import { StatusChip } from "./status-chip";

type HeroStatusCardProps = {
  confidence: number;
  eta: number;
  lastSync: string | null;
  occupancy: number;
  responders: number;
  status: SystemStatus;
};

export const HeroStatusCard = memo(function HeroStatusCard({ confidence, eta, lastSync, occupancy, responders, status }: HeroStatusCardProps) {
  const tone = statusTone(status);
  const riskScore = riskScoreFromStatus(status);

  return (
    <GlassCard className="p-0" glow={tone}>
      <div
        className={cn(
          "relative overflow-hidden rounded-[28px] p-5",
          tone === "safe" && "bg-[radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.22),transparent_38%)]",
          tone === "warning" && "bg-[radial-gradient(circle_at_80%_0%,rgba(245,158,11,0.24),transparent_38%)]",
          tone === "critical" && "bg-[radial-gradient(circle_at_80%_0%,rgba(239,68,68,0.26),transparent_42%)]",
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300/70">Building posture</p>
            <h2 className="mt-3 text-5xl font-black tracking-[-0.09em] text-white">{STATUS_COPY[status].label}</h2>
            <p className="mt-3 max-w-[17rem] text-sm leading-6 text-slate-200">{STATUS_COPY[status].message}</p>
          </div>
          <StatusChip status={status} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs text-slate-400">Confidence</p>
            <p className="mt-1 text-2xl font-bold text-white">{confidence}%</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs text-slate-400">Response ETA</p>
            <p className="mt-1 text-2xl font-bold text-white">{responders > 0 ? formatEta(eta) : "Ready"}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs text-slate-400">Occupants</p>
            <p className="mt-1 text-2xl font-bold text-white">{occupancy}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs text-slate-400">Responders</p>
            <p className="mt-1 text-2xl font-bold text-white">{responders > 0 ? `${responders} en route` : "Standby"}</p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/[0.055] px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Risk score</span>
          <span className={cn("text-sm font-bold", tone === "safe" && "text-emerald-100", tone === "warning" && "text-amber-100", tone === "critical" && "text-red-100")}>
            {riskScore}/100
          </span>
          <span className="ml-auto text-xs text-slate-400">Synced {formatLastSync(lastSync)}</span>
        </div>
      </div>
    </GlassCard>
  );
});
