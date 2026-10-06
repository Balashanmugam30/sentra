"use client";

import { memo } from "react";

import { formatLastSync } from "@/lib/mobile/helpers";
import type { SyncQueueItem } from "@/lib/mobile/types";
import { EmptyState } from "./empty-state";
import { GlassCard } from "./glass-card";

type OfflineSyncCardProps = {
  lastCachedAt: string | null;
  networkOnline: boolean;
  onRetry: () => void;
  queue: SyncQueueItem[];
};

export const OfflineSyncCard = memo(function OfflineSyncCard({ lastCachedAt, networkOnline, onRetry, queue }: OfflineSyncCardProps) {
  return (
    <GlassCard glow={networkOnline ? "safe" : "warning"}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-100/70">Offline continuity</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.05em] text-white">{networkOnline ? "Sync ready" : "Limited mode active"}</h2>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-bold text-slate-100">{queue.length} queued</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">Cached route, emergency instructions, pending tasks, SOS requests, and acknowledgements remain available on this device.</p>
      <p className="mt-2 text-xs text-slate-500">Cached {formatLastSync(lastCachedAt)}</p>

      <div className="mt-4 space-y-2">
        {queue.length === 0 ? (
          <EmptyState description="No offline actions are waiting. Your last known command state is clean." title="Sync queue clear" tone="safe" />
        ) : (
          queue.slice(0, 5).map((item) => (
            <article className="rounded-2xl border border-white/10 bg-black/18 p-3" key={item.id}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-white">{item.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.type} / {formatLastSync(item.createdAt)}</p>
                </div>
                <span className="rounded-full border border-amber-300/20 bg-amber-400/10 px-2 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-amber-100">
                  {item.status}
                </span>
              </div>
            </article>
          ))
        )}
      </div>

      <button className="mt-4 min-h-12 w-full rounded-2xl border border-blue-300/20 bg-blue-400/12 text-sm font-bold text-blue-50" onClick={onRetry} type="button">
        Retry Sync
      </button>
    </GlassCard>
  );
});
