"use client";

import { useMemo } from "react";

import { useAuthStore } from "@/store/auth-store";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const avatarLabel = useMemo(() => {
    const base = user?.displayName?.trim() || user?.email?.trim() || "S";
    return base.charAt(0).toUpperCase();
  }, [user?.displayName, user?.email]);

  return (
    <div className="flex h-full min-h-0 flex-1 overflow-y-auto px-6 pb-10 pt-24 md:px-8 md:pt-28">
      <div className="mx-auto w-full max-w-[900px] space-y-6">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.28em]" style={{ color: "var(--sentra-text-soft)" }}>
            Profile
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[var(--text)] md:text-4xl">
            Account profile
          </h1>
          <p className="max-w-2xl text-sm leading-7 md:text-base" style={{ color: "var(--sentra-text-muted)" }}>
            Review your Sentra identity details and the account currently connected to the system console.
          </p>
        </div>

        <section
          className="rounded-[28px] border p-6 backdrop-blur-2xl"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface)",
            boxShadow: "var(--sentra-shadow-panel)",
          }}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full border text-2xl font-semibold"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface)",
                boxShadow: "var(--sentra-shadow-glow)",
                color: "var(--text)",
              }}
            >
              {avatarLabel}
            </div>

            <div className="grid flex-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm" style={{ color: "var(--text-muted)" }}>Name</label>
                <div
                  className="rounded-2xl border px-4 py-3"
                  style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }}
                >
                  {user?.displayName || "Sentra User"}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm" style={{ color: "var(--text-muted)" }}>Email</label>
                <div
                  className="rounded-2xl border px-4 py-3"
                  style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text-muted)" }}
                >
                  {user?.email || "No email connected"}
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm" style={{ color: "var(--text-muted)" }}>Role</label>
                <div
                  className="rounded-2xl border px-4 py-3"
                  style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }}
                >
                  {user?.role || "guest"}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
