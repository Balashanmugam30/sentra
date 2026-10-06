"use client";

import { useEffect, useState } from "react";

import { HeroStatusCard } from "@/components/mobile/hero-status-card";
import { IncidentFeed } from "@/components/mobile/incident-feed";
import { MiniMetrics } from "@/components/mobile/mini-metrics";
import { OfflineSyncCard } from "@/components/mobile/offline-sync-card";
import { PerformanceChip } from "@/components/mobile/performance-chip";
import { QuickActions } from "@/components/mobile/quick-actions";
import { DEMO_SCENARIO_LABELS } from "@/lib/mobile/demoEngine";
import { BUILDING_NAME, ROLE_OPTIONS } from "@/lib/mobile/constants";
import { cn, formatClock, formatRole } from "@/lib/mobile/helpers";
import type { DemoScenario } from "@/lib/mobile/types";
import { useMobileStore } from "@/store/useMobileStore";

const scenarioOrder: DemoScenario[] = ["safe", "warning_smoke", "active_fire", "corridor_blocked"];

export default function HomePage() {
  const activeScenario = useMobileStore((state) => state.activeScenario);
  const blockedZones = useMobileStore((state) => state.blockedZones);
  const confidence = useMobileStore((state) => state.confidence);
  const eta = useMobileStore((state) => state.eta);
  const incident = useMobileStore((state) => state.incident);
  const lastCachedAt = useMobileStore((state) => state.lastCachedAt);
  const lastSync = useMobileStore((state) => state.lastSync);
  const networkOnline = useMobileStore((state) => state.networkOnline);
  const occupancy = useMobileStore((state) => state.occupancy);
  const responders = useMobileStore((state) => state.responders);
  const setDemoScenario = useMobileStore((state) => state.setDemoScenario);
  const setRole = useMobileStore((state) => state.setRole);
  const syncQueue = useMobileStore((state) => state.syncQueue);
  const flushSyncQueue = useMobileStore((state) => state.flushSyncQueue);
  const systemStatus = useMobileStore((state) => state.systemStatus);
  const userRole = useMobileStore((state) => state.userRole);
  const [clock, setClock] = useState("Syncing");

  useEffect(() => {
    const updateClock = () => setClock(formatClock(new Date()));
    updateClock();
    const timer = window.setInterval(updateClock, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-white/10 bg-white/[0.055] p-4 shadow-[0_22px_60px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100/60">Sentra Mobile</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.08em] text-white">{BUILDING_NAME}</h1>
            <p className="mt-2 text-sm text-slate-400">Current time: {clock}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-bold",
                networkOnline ? "border-emerald-300/25 bg-emerald-400/12 text-emerald-100" : "border-amber-300/25 bg-amber-400/12 text-amber-100",
              )}
            >
              {networkOnline ? "Online" : "Offline"}
            </span>
            <PerformanceChip label="PWA ready" />
          </div>
        </div>
      </section>

      {!networkOnline || syncQueue.length > 0 ? <OfflineSyncCard lastCachedAt={lastCachedAt} networkOnline={networkOnline} onRetry={flushSyncQueue} queue={syncQueue} /> : null}

      <HeroStatusCard confidence={confidence} eta={eta} lastSync={lastSync} occupancy={occupancy} responders={responders} status={systemStatus} />

      <QuickActions />

      <MiniMetrics blockedZones={blockedZones} eta={eta} occupancy={occupancy} status={systemStatus} />

      <section aria-labelledby="role-title" className="rounded-[28px] border border-white/10 bg-white/[0.06] p-4 backdrop-blur-2xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100/60">Role</p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.05em] text-white" id="role-title">
              {formatRole(userRole)}
            </h2>
          </div>
          <span className="rounded-full border border-blue-300/20 bg-blue-400/12 px-3 py-1 text-xs font-semibold text-blue-100">Persisted</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {ROLE_OPTIONS.map((option) => (
            <button
              aria-pressed={userRole === option.role}
              className={cn(
                "min-h-14 rounded-2xl border px-3 text-left text-sm font-semibold transition",
                userRole === option.role ? "border-blue-300/35 bg-blue-400/16 text-white" : "border-white/10 bg-black/18 text-slate-300",
              )}
              key={option.role}
              onClick={() => setRole(option.role)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="demo-title" className="rounded-[28px] border border-white/10 bg-black/20 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100/60">Demo engine</p>
        <h2 className="mt-1 text-xl font-semibold tracking-[-0.05em] text-white" id="demo-title">
          Simulate posture
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {scenarioOrder.map((scenario) => (
            <button
              aria-pressed={activeScenario === scenario}
              className={cn(
                "min-h-20 rounded-2xl border p-3 text-left transition",
                activeScenario === scenario ? "border-cyan-300/35 bg-cyan-400/14 text-white shadow-[0_0_30px_rgba(34,211,238,0.12)]" : "border-white/10 bg-white/[0.045] text-slate-300",
              )}
              key={scenario}
              onClick={() => setDemoScenario(scenario)}
              type="button"
            >
              <span className="block text-sm font-bold">{DEMO_SCENARIO_LABELS[scenario].label}</span>
              <span className="mt-1 block text-[0.68rem] leading-4 text-slate-400">{DEMO_SCENARIO_LABELS[scenario].description}</span>
            </button>
          ))}
        </div>
      </section>

      <IncidentFeed incident={incident} status={systemStatus} />
    </div>
  );
}
