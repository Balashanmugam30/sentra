"use client";

import Link from "next/link";

import { EmptyState } from "../../components/mobile/empty-state";
import { GlassCard } from "../../components/mobile/glass-card";
import { OfflineSyncCard } from "../../components/mobile/offline-sync-card";
import { PerformanceChip } from "../../components/mobile/performance-chip";
import { useMobileStore } from "../../store/useMobileStore";

export default function OfflinePage() {
  const incident = useMobileStore((state) => state.incident);
  const lastCachedAt = useMobileStore((state) => state.lastCachedAt);
  const networkOnline = useMobileStore((state) => state.networkOnline);
  const route = useMobileStore((state) => state.route);
  const staffTasks = useMobileStore((state) => state.staffTasks);
  const syncQueue = useMobileStore((state) => state.syncQueue);
  const flushSyncQueue = useMobileStore((state) => state.flushSyncQueue);

  return (
    <div className="space-y-5">
      <GlassCard glow="warning">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-100/70">Offline Mode</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.09em] text-white">Verified snapshot active</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Sentra Mobile keeps route guidance, emergency instructions, staff tasks, SOS queue, and acknowledgements available while reconnecting.
            </p>
          </div>
          <PerformanceChip label="Offline PWA" />
        </div>
      </GlassCard>

      <OfflineSyncCard lastCachedAt={lastCachedAt} networkOnline={networkOnline} onRetry={flushSyncQueue} queue={syncQueue} />

      <div className="grid grid-cols-2 gap-3">
        <GlassCard glow={route ? "safe" : "warning"}>
          <p className="text-xs text-slate-400">Cached route</p>
          <p className="mt-1 text-lg font-black text-white">{route?.destination ?? "Unavailable"}</p>
        </GlassCard>
        <GlassCard glow={incident ? "critical" : "safe"}>
          <p className="text-xs text-slate-400">Emergency guide</p>
          <p className="mt-1 text-lg font-black text-white">{incident?.title ?? "No active incident"}</p>
        </GlassCard>
      </div>

      {route || incident || staffTasks.length > 0 ? (
        <GlassCard>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100/60">Cached continuity</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>Last known route remains available.</li>
            <li>{staffTasks.length} staff tasks preserved.</li>
            <li>Emergency instructions stay visible until command sync returns.</li>
          </ul>
        </GlassCard>
      ) : (
        <EmptyState description="No cached route or incident is currently available. Stay with staff and use posted safety signage." title="No offline cache found" tone="warning" />
      )}

      <Link className="flex min-h-14 items-center justify-center rounded-[22px] border border-blue-300/20 bg-blue-400/12 text-sm font-semibold text-blue-50" href="/home">
        Return home
      </Link>
    </div>
  );
}
