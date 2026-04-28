"use client";

import Link from "next/link";
import type { Route } from "next";

import { AlertsFeed } from "@/components/security/alerts-feed";
import { DeviceBoard } from "@/components/security/device-board";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { SessionGrid } from "@/components/security/session-grid";
import { useSecurityCenter } from "@/lib/securitycenter/use-security";

export default function SecuritySessionsPage() {
  const { sessions, users, summary, busyAction, loading, error, lastAction, revokeSession, refresh } = useSecurityCenter();
  const active = sessions.filter((session) => session.status === "active").length;
  const risky = sessions.filter((session) => session.risk_score >= 60).length;

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[#02040a] px-5 py-8 text-white md:px-8">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(248,113,113,0.14),transparent_32%),linear-gradient(180deg,#02040a_0%,#030712_100%)]" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6">
          <header className="rounded-[34px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-2xl">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-red-100/70">Session Intelligence</p>
                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-white md:text-5xl">Live devices, token age, and suspicious access</h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-white/55">
                  Detect impossible travel, stale sessions, unknown devices, and high-risk tokens before they become enterprise incidents.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10" href={"/security/users" as Route}>
                  Users
                </Link>
                <button className="rounded-2xl bg-red-100 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60" disabled={loading} onClick={() => void refresh()} type="button">
                  Refresh
                </button>
              </div>
            </div>
            {(error || lastAction) && <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/60">{error ? `Resilient mode: ${error}` : lastAction}</div>}
          </header>

          <div className="grid gap-4 md:grid-cols-4">
            <Kpi label="Sessions" value={sessions.length} />
            <Kpi label="Active" value={active} />
            <Kpi label="High Risk" value={risky} />
            <Kpi label="Trusted Devices" value={summary.devices_trusted} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <SessionGrid busyAction={busyAction} onRevoke={revokeSession} sessions={sessions} users={users} />
            <div className="grid gap-6">
              <DeviceBoard sessions={sessions} />
              <AlertsFeed alerts={summary.recent_alerts} />
            </div>
          </div>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

function Kpi({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">{label}</p>
      <p className="mt-3 font-mono text-3xl text-white">{value}</p>
    </div>
  );
}
