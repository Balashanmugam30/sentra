import Link from "next/link";
import type { Route } from "next";

import { AnomalyFeed } from "@/components/security/anomaly-feed";
import { AuditLedger } from "@/components/security/audit-ledger";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { RetentionPanel } from "@/components/security/retention-panel";
import { SecurityScoreCard } from "@/components/security/security-score-card";

export default function AuditPage() {
  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[#02040a] px-5 py-8 text-white md:px-8">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_36%),radial-gradient(circle_at_bottom,rgba(248,113,113,0.07),transparent_28%),linear-gradient(180deg,#02040a_0%,#030712_100%)]" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6">
          <header className="flex flex-col gap-4 rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
                Immutable Audit
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
                Compliance evidence and denied-request ledger
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/55">
                Hash-linked records for login success/failure, logout, role changes,
                alert triggers, route overrides, exports, approvals, and access denials.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10"
                href={"/security" as Route}
              >
                Security Center
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
          <AuditLedger />

          <div className="grid gap-6 lg:grid-cols-2">
            <RetentionPanel />
            <AnomalyFeed />
          </div>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}
