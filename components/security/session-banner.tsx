"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { formatSessionDuration, getSessionTimeRemaining } from "@/lib/security/session";
import { useAuth } from "@/lib/auth/use-auth";
import { useAuthStore } from "@/store/auth-store";

export function SessionBanner() {
  const router = useRouter();
  const { logout, refreshSession } = useAuth();
  const authStatus = useAuthStore((state) => state.authStatus);
  const sessionWarningAt = useAuthStore((state) => state.sessionWarningAt);
  const sessionExpiresAt = useAuthStore((state) => state.sessionExpiresAt);
  const timeoutWarningDismissedAt = useAuthStore((state) => state.timeoutWarningDismissedAt);
  const dismissTimeoutWarning = useAuthStore((state) => state.dismissTimeoutWarning);
  const touchSession = useAuthStore((state) => state.touchSession);
  const lastActivityAt = useAuthStore((state) => state.lastActivityAt);
  const [now, setNow] = useState(() => Date.now());
  const lastTouchRef = useRef(0);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      return undefined;
    }

    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [authStatus]);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      return undefined;
    }

    const activityEvents = ["click", "keydown", "pointermove", "touchstart"];
    const handleActivity = () => {
      const current = Date.now();
      if (current - lastTouchRef.current < 30_000) {
        return;
      }
      lastTouchRef.current = current;
      touchSession();
    };

    activityEvents.forEach((eventName) => window.addEventListener(eventName, handleActivity, { passive: true }));
    return () => {
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, handleActivity));
    };
  }, [authStatus, touchSession]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !sessionExpiresAt) {
      return;
    }

    // Grace period: do not expire session if created or touched within the last 60 seconds
    if (lastActivityAt && now - lastActivityAt < 60_000) {
      return;
    }

    if (now < sessionExpiresAt) {
      return;
    }

    void logout().then(() => router.replace("/login?reason=session-timeout"));
  }, [authStatus, lastActivityAt, logout, now, router, sessionExpiresAt]);

  const shouldShow = useMemo(() => {
    if (authStatus !== "authenticated" || !sessionWarningAt || !sessionExpiresAt) {
      return false;
    }
    if (timeoutWarningDismissedAt && timeoutWarningDismissedAt > sessionWarningAt) {
      return false;
    }
    return now >= sessionWarningAt && now < sessionExpiresAt;
  }, [authStatus, now, sessionExpiresAt, sessionWarningAt, timeoutWarningDismissedAt]);

  if (!shouldShow) {
    return null;
  }

  const remaining = formatSessionDuration(getSessionTimeRemaining(sessionExpiresAt));

  return (
    <div className="fixed inset-x-4 top-24 z-[70] mx-auto flex max-w-3xl items-center justify-between gap-4 rounded-2xl border border-amber-300/25 bg-slate-950/85 px-4 py-3 text-sm text-amber-50 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
      <div>
        <p className="font-semibold">Session timeout approaching</p>
        <p className="text-xs text-amber-100/70">For security, Sentra will sign out in {remaining}.</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/75 transition hover:bg-white/10"
          onClick={dismissTimeoutWarning}
          type="button"
        >
          Dismiss
        </button>
        <button
          className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-white"
          onClick={() => void refreshSession()}
          type="button"
        >
          Keep Working
        </button>
        <button
          className="rounded-full border border-rose-300/25 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-400/10"
          onClick={() => void logout().then(() => router.replace("/login"))}
          type="button"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
