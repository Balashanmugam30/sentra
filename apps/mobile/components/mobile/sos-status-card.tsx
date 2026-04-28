"use client";

import { memo } from "react";

import { cn, formatLastSync, formatRole } from "../../lib/mobile/helpers";
import type { SosRequest } from "../../lib/mobile/types";
import { GlassCard } from "./glass-card";

type SosStatusCardProps = {
  onAcknowledge: (requestId: string) => void;
  onResolve: (requestId: string) => void;
  requests: SosRequest[];
};

function statusClass(status: SosRequest["status"]) {
  if (status === "resolved") {
    return "border-emerald-300/20 bg-emerald-400/12 text-emerald-100";
  }
  if (status === "acknowledged") {
    return "border-blue-300/20 bg-blue-400/12 text-blue-100";
  }
  if (status === "dispatched") {
    return "border-amber-300/20 bg-amber-400/12 text-amber-100";
  }
  return "border-white/10 bg-white/[0.06] text-slate-200";
}

export const SosStatusCard = memo(function SosStatusCard({ onAcknowledge, onResolve, requests }: SosStatusCardProps) {
  const activeRequests = requests.filter((request) => request.status !== "resolved");

  return (
    <GlassCard glow="critical">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-100/70">SOS queue</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.05em] text-white">{activeRequests.length} active requests</h2>
        </div>
        <span className="rounded-full border border-red-300/25 bg-red-500/15 px-3 py-1 text-xs font-bold text-red-100">Priority sync</span>
      </div>
      <div className="mt-4 space-y-3">
        {requests.slice(0, 7).map((request) => (
          <article className="rounded-[24px] border border-white/10 bg-black/20 p-4" key={request.id}>
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white">{request.message}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  {request.currentZone} / {formatRole(request.role)} / battery {request.batteryLevel}
                </p>
                <p className="mt-1 font-mono text-[0.68rem] text-slate-500">
                  {request.id} / {formatLastSync(request.sentAt ?? request.queuedAt)}
                </p>
              </div>
              <span className={cn("rounded-full border px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em]", statusClass(request.status))}>
                {request.status ?? "queued"}
              </span>
            </div>
            {request.status !== "resolved" ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button className="min-h-10 rounded-2xl border border-blue-300/20 bg-blue-400/12 text-xs font-bold text-blue-50" onClick={() => onAcknowledge(request.id)} type="button">
                  Acknowledge
                </button>
                <button className="min-h-10 rounded-2xl border border-emerald-300/20 bg-emerald-400/12 text-xs font-bold text-emerald-50" onClick={() => onResolve(request.id)} type="button">
                  Resolve
                </button>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </GlassCard>
  );
});
