"use client";

import { useState } from "react";

import { InstallAppCard } from "../../components/mobile/install-app-card";
import { NotificationCenter } from "../../components/mobile/notification-center";
import { OfflineSyncCard } from "../../components/mobile/offline-sync-card";
import { PerformanceChip } from "../../components/mobile/performance-chip";
import { VoiceGuidancePanel } from "../../components/mobile/voice-guidance-panel";
import { GlassCard } from "../../components/mobile/glass-card";
import { clearSentraOfflineCache } from "../../lib/mobile/offline";
import type { MobileTheme } from "../../lib/mobile/types";
import { useMobileStore } from "../../store/useMobileStore";

export default function SettingsPage() {
  const addNotification = useMobileStore((state) => state.addNotification);
  const clearNotifications = useMobileStore((state) => state.clearNotifications);
  const clearOfflineState = useMobileStore((state) => state.clearOfflineState);
  const flushSyncQueue = useMobileStore((state) => state.flushSyncQueue);
  const highContrast = useMobileStore((state) => state.highContrast);
  const lastCachedAt = useMobileStore((state) => state.lastCachedAt);
  const lastVoiceInstruction = useMobileStore((state) => state.lastVoiceInstruction);
  const networkOnline = useMobileStore((state) => state.networkOnline);
  const notificationHistory = useMobileStore((state) => state.notificationHistory);
  const notificationPermission = useMobileStore((state) => state.notificationPermission);
  const notificationsEnabled = useMobileStore((state) => state.notificationsEnabled);
  const reducedMotion = useMobileStore((state) => state.reducedMotion);
  const setNotificationPermission = useMobileStore((state) => state.setNotificationPermission);
  const setReducedMotion = useMobileStore((state) => state.setReducedMotion);
  const setTheme = useMobileStore((state) => state.setTheme);
  const setVoiceInstruction = useMobileStore((state) => state.setVoiceInstruction);
  const setVoiceRate = useMobileStore((state) => state.setVoiceRate);
  const syncQueue = useMobileStore((state) => state.syncQueue);
  const theme = useMobileStore((state) => state.theme);
  const toggleHighContrast = useMobileStore((state) => state.toggleHighContrast);
  const toggleNotifications = useMobileStore((state) => state.toggleNotifications);
  const toggleReducedMotion = useMobileStore((state) => state.toggleReducedMotion);
  const toggleVoice = useMobileStore((state) => state.toggleVoice);
  const voiceEnabled = useMobileStore((state) => state.voiceEnabled);
  const voiceRate = useMobileStore((state) => state.voiceRate);
  const [cacheStatus, setCacheStatus] = useState("Ready");

  const clearCache = async () => {
    const cleared = await clearSentraOfflineCache();
    clearOfflineState();
    setCacheStatus(cleared ? "Offline cache cleared" : "Cache API unavailable");
  };

  return (
    <div className="space-y-5">
      <GlassCard glow="accent">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100/60">Settings</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.09em] text-white">Mobile readiness</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">Control notifications, voice guidance, offline cache, accessibility, and install readiness.</p>
          </div>
          <PerformanceChip label="QA ready" />
        </div>
      </GlassCard>

      <NotificationCenter
        addNotification={addNotification}
        clearNotifications={clearNotifications}
        enabled={notificationsEnabled}
        history={notificationHistory}
        onPermission={setNotificationPermission}
        permission={notificationPermission}
        toggleEnabled={toggleNotifications}
      />

      <VoiceGuidancePanel
        enabled={voiceEnabled}
        lastInstruction={lastVoiceInstruction}
        onInstruction={setVoiceInstruction}
        rate={voiceRate}
        setRate={setVoiceRate}
        toggleVoice={toggleVoice}
      />

      <GlassCard glow="safe">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100/60">Accessibility</p>
        <h2 className="mt-1 text-xl font-semibold tracking-[-0.05em] text-white">Stress-safe display</h2>
        <div className="mt-4 space-y-3">
          <button className="flex min-h-14 w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.045] px-4 text-left" onClick={toggleHighContrast} type="button">
            <span>High contrast mode</span>
            <span className="font-semibold">{highContrast ? "On" : "Off"}</span>
          </button>
          <button className="flex min-h-14 w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.045] px-4 text-left" onClick={toggleReducedMotion} type="button">
            <span>Reduced motion</span>
            <span className="font-semibold">{reducedMotion ? "On" : "Off"}</span>
          </button>
          <label className="flex min-h-14 items-center justify-between rounded-2xl border border-white/10 bg-white/[0.045] px-4">
            <span>Theme mode</span>
            <select className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm font-semibold text-white" onChange={(event) => setTheme(event.target.value as MobileTheme)} value={theme}>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </label>
          <button className="flex min-h-14 w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.045] px-4 text-left" onClick={() => setReducedMotion(false)} type="button">
            <span>Animation profile</span>
            <span className="font-semibold">{reducedMotion ? "Reduced" : "Smooth"}</span>
          </button>
        </div>
      </GlassCard>

      <OfflineSyncCard lastCachedAt={lastCachedAt} networkOnline={networkOnline} onRetry={flushSyncQueue} queue={syncQueue} />

      <GlassCard glow="warning">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-100/70">Offline cache</p>
        <h2 className="mt-1 text-xl font-semibold tracking-[-0.05em] text-white">Clear cached emergency shell</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">Use only when troubleshooting a stale device. Active SOS and operations state are preserved in app storage unless cleared by command sync.</p>
        <button className="mt-4 min-h-12 w-full rounded-2xl border border-amber-300/20 bg-amber-400/12 text-sm font-bold text-amber-50" onClick={clearCache} type="button">
          {cacheStatus}
        </button>
      </GlassCard>

      <InstallAppCard />

      <GlassCard>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100/60">About Sentra</p>
        <h2 className="mt-1 text-xl font-semibold tracking-[-0.05em] text-white">Crisis mobile command</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">Sentra Mobile is built for hotels, campuses, airports, and field teams that need route guidance, SOS coordination, voice instructions, and offline continuity.</p>
      </GlassCard>
    </div>
  );
}
