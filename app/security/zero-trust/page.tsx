"use client";

import Link from "next/link";
import type { Route } from "next";

import { PolicyGrid } from "@/components/security/policy-grid";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { SessionRiskGrid } from "@/components/security/session-risk-grid";
import { ZeroScore } from "@/components/security/zero-score";
import { useSecurityDefense } from "@/lib/securitydefense/use-defense";

export default function SecurityZeroTrustPage() {
  const { zeroTrust, busyAction, loading, error, lastAction, revokeSession, stepUpAuth, refresh } = useSecurityDefense();
  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[#02040a] px-5 py-8 text-white md:px-8">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.15),transparent_32%),radial-gradient(circle_at_78%_18%,rgba(16,185,129,0.1),transparent_28%),linear-gradient(180deg,#02040a_0%,#030712_100%)]" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6">
          <header className="rounded-[34px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-2xl">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-100/70">Zero Trust Control Room</p>
                <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.045em] text-white md:text-5xl">Never trust, continuously verify every session and action</h1>
                <p className="mt-4 max-w-3xl text-sm leading-6 text-white/55">Scores combine MFA, known device, role sensitivity, geo shift, session age, token anomalies, failed attempts, and suspicious actions.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10" href={"/security/executive" as Route}>Executive</Link>
                <button className="rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60" disabled={loading} onClick={() => void refresh()} type="button">Refresh</button>
              </div>
            </div>
            {(error || lastAction) && <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/60">{error ? `Resilient mode: ${error}` : lastAction}</div>}
          </header>

          <ZeroScore zeroTrust={zeroTrust} />
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <PolicyGrid policies={zeroTrust.policies} />
            <SessionRiskGrid busyAction={busyAction} identities={zeroTrust.identities} onRevokeSession={() => revokeSession()} />
          </div>
          <button className="rounded-2xl border border-cyan-200/20 bg-cyan-300/10 px-5 py-4 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/20 disabled:opacity-60" disabled={busyAction !== null} onClick={() => stepUpAuth()} type="button">
            Trigger Step-Up Authentication for Risky Admin
          </button>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}
