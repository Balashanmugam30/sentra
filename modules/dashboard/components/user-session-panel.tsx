"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth/use-auth";

export function UserSessionPanel() {
  const router = useRouter();
  const { user, refreshSession, logout } = useAuth();
  const [busyAction, setBusyAction] = useState<"refresh" | "logout" | null>(null);
  const [message, setMessage] = useState("");
  const messageTimerRef = useRef<number | null>(null);

  const resolvedName = useMemo(() => {
    return user?.displayName || user?.email || "Sentra User";
  }, [user?.displayName, user?.email]);

  useEffect(() => {
    return () => {
      if (messageTimerRef.current !== null) {
        window.clearTimeout(messageTimerRef.current);
      }
    };
  }, []);

  const showTransientMessage = (nextMessage: string) => {
    setMessage(nextMessage);
    if (messageTimerRef.current !== null) {
      window.clearTimeout(messageTimerRef.current);
    }
    messageTimerRef.current = window.setTimeout(() => {
      setMessage("");
      messageTimerRef.current = null;
    }, 2200);
  };

  const handleRefresh = async () => {
    if (busyAction !== null) {
      return;
    }
    setBusyAction("refresh");
    setMessage("");
    try {
      const result = await refreshSession();
      if (result.ok) {
        showTransientMessage("Session refreshed");
        return;
      }

      showTransientMessage(result.error?.detail ?? "Refresh failed");
      router.replace("/login");
    } finally {
      setBusyAction(null);
    }
  };

  const handleLogout = async () => {
    if (busyAction !== null) {
      return;
    }
    setBusyAction("logout");
    setMessage("");
    try {
      await logout();
    } finally {
      setBusyAction(null);
    }
    router.replace("/login");
  };

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.74)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-200/70">
            Secure Session
          </p>
          <h2 className="text-lg font-semibold text-white">Signed in as: {resolvedName}</h2>
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/65">
            <span>Role: {user?.role ?? "viewer"}</span>
            <span>Session: active</span>
          </div>
          {message ? <p className="text-xs text-cyan-100/75">{message}</p> : null}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/10 px-4 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/15 disabled:opacity-60"
            disabled={busyAction !== null}
            onClick={() => void handleRefresh()}
            type="button"
          >
            {busyAction === "refresh" ? "Refreshing..." : "Refresh Session"}
          </button>
          <button
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-rose-300/15 bg-rose-300/10 px-4 text-sm font-medium text-rose-100 transition hover:bg-rose-300/15 disabled:opacity-60"
            disabled={busyAction !== null}
            onClick={() => void handleLogout()}
            type="button"
          >
            {busyAction === "logout" ? "Signing out..." : "Logout"}
          </button>
        </div>
      </div>
    </section>
  );
}
