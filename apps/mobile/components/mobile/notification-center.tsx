"use client";

import { memo } from "react";

import { requestNotificationPermission, sendLocalNotification } from "../../lib/mobile/notifications";
import type { MobileNotification, NotificationPermissionState } from "../../lib/mobile/types";
import { EmptyState } from "./empty-state";
import { GlassCard } from "./glass-card";

type NotificationCenterProps = {
  addNotification: (title: string, body: string, type?: MobileNotification["type"]) => void;
  clearNotifications: () => void;
  enabled: boolean;
  history: MobileNotification[];
  onPermission: (permission: NotificationPermissionState) => void;
  permission: NotificationPermissionState;
  toggleEnabled: () => void;
};

export const NotificationCenter = memo(function NotificationCenter({ addNotification, clearNotifications, enabled, history, onPermission, permission, toggleEnabled }: NotificationCenterProps) {
  const requestPermission = async () => {
    const nextPermission = await requestNotificationPermission();
    onPermission(nextPermission);
    addNotification("NOTIFICATION PERMISSION UPDATED", `Permission state: ${nextPermission}`, "system");
  };

  const triggerDemo = () => {
    const title = "ROUTE UPDATED USE EXIT B";
    const body = "Service Hall C is active. Avoid Kitchen Corridor B.";
    sendLocalNotification(title, body);
    addNotification(title, body, "route");
  };

  return (
    <GlassCard glow="accent">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100/60">Notifications</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.05em] text-white">{history.length} recent alerts</h2>
        </div>
        <button className="min-h-10 rounded-full border border-white/10 bg-white/[0.06] px-3 text-xs font-bold text-slate-100" onClick={toggleEnabled} type="button">
          {enabled ? "Mute" : "Unmute"}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="min-h-12 rounded-2xl border border-blue-300/20 bg-blue-400/12 text-xs font-bold text-blue-50" onClick={requestPermission} type="button">
          Permission: {permission}
        </button>
        <button className="min-h-12 rounded-2xl border border-emerald-300/20 bg-emerald-400/12 text-xs font-bold text-emerald-50" onClick={triggerDemo} type="button">
          Test Alert
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {history.length === 0 ? (
          <EmptyState description="Critical alerts, route changes, responder ETAs, and task assignments will appear here." title="No notifications yet" />
        ) : (
          history.slice(0, 5).map((item) => (
            <article className="rounded-3xl border border-white/10 bg-black/18 p-4" key={item.id}>
              <p className="text-sm font-black text-white">{item.title}</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">{item.body}</p>
            </article>
          ))
        )}
      </div>

      <button className="mt-4 min-h-11 w-full rounded-2xl border border-white/10 bg-white/[0.045] text-xs font-bold text-slate-100" onClick={clearNotifications} type="button">
        Clear Notification History
      </button>
    </GlassCard>
  );
});
