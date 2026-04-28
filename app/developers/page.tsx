"use client";

import Link from "next/link";

import { DeveloperPlatformPanel } from "@/components/developers/developer-platform-panel";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useDevelopers } from "@/lib/developers/use-developers";

export default function DevelopersPage() {
  const { summary, loading, error, busyAction, lastAction, refresh, createKey } = useDevelopers();

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[#02040a] px-5 py-8 text-white md:px-8">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(34,211,238,0.17),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.12),transparent_32%),linear-gradient(180deg,#02040a_0%,#030712_100%)]" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6">
          <header className="rounded-[34px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/65">API Platform</p>
                <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.045em] text-white md:text-6xl">Builder-ready Sentra public APIs</h1>
                <p className="mt-4 max-w-3xl text-sm leading-6 text-white/55">Tenant scoped API keys, docs, usage analytics, rate limits, webhooks, SDK examples, and sandbox mode for external integrations.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10" href="/platform/developers">Platform OS</Link>
                <button className="rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60" disabled={loading} onClick={() => void refresh()} type="button">
                  {loading ? "Refreshing" : "Refresh APIs"}
                </button>
              </div>
            </div>
            {(error || lastAction) && <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/60">{error ? `Resilient mode: ${error}` : lastAction}</div>}
          </header>
          <DeveloperPlatformPanel summary={summary} busyAction={busyAction} onCreateKey={() => void createKey()} />
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}
