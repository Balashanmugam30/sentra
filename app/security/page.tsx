import Link from "next/link";
import type { Route } from "next";

import { SecurityCommandAnalytics } from "@/components/analytics/premium-charts";
import { AnomalyFeed } from "@/components/security/anomaly-feed";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { PrivacyControls } from "@/components/security/privacy-controls";
import { RateLimitMonitor } from "@/components/security/rate-limit-monitor";
import { RetentionPanel } from "@/components/security/retention-panel";
import { SecurityScoreCard } from "@/components/security/security-score-card";
import { SessionDevices } from "@/components/security/session-devices";

export default function SecurityPage() {
  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[#02040a] px-5 py-8 text-white md:px-8">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.08),transparent_30%),linear-gradient(180deg,#02040a_0%,#030712_100%)]" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6">
          <header className="flex flex-col gap-4 rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
                Sentra Trust Layer
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
                Security hardening and privacy command center
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/55">
                Live enterprise posture across authentication, sessions, privacy, retention,
                abuse prevention, and anomaly detection.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                className="rounded-2xl border border-cyan-200/20 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/20"
                href={"/security/access" as Route}
              >
                Identity Access Center
              </Link>
              <Link
                className="rounded-2xl border border-red-200/20 bg-red-400/10 px-4 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-400/20"
                href={"/security/soc" as Route}
              >
                Threat Defense SOC
              </Link>
              <Link
                className="rounded-2xl border border-emerald-200/20 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/20"
                href={"/security/trust-executive" as Route}
              >
                Trust Room
              </Link>
              <Link
                className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10"
                href={"/audit" as Route}
              >
                Open Audit Ledger
              </Link>
              <Link
                className="rounded-2xl bg-cyan-100 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-white"
                href="/app"
              >
                Back to Command
              </Link>
            </div>
          </header>

          <SecurityScoreCard />
          <SecurityCommandAnalytics />

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-6">
              <PrivacyControls />
              <RetentionPanel />
              <SessionDevices />
            </div>
            <div className="grid gap-6">
              <RateLimitMonitor />
              <AnomalyFeed />
            </div>
          </div>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}
