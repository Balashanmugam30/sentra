"use client";

import Link from "next/link";
import type { Route } from "next";

import { AbuseTable } from "@/components/security/abuse-table";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { SessionRiskGrid } from "@/components/security/session-risk-grid";
import { ThreatRadar } from "@/components/security/threat-radar";
import { useSecurityDefense } from "@/lib/securitydefense/use-defense";

export default function SecurityThreatsPage() {
  const { threats, zeroTrust, busyAction, loading, error, lastAction, isolateKey, revokeSession, refresh } = useSecurityDefense();
  const radarSignals = threats.threats.map((threat) => ({
    label: threat.category.replaceAll("_", " "),
    value: threat.risk,
    tone: threat.risk >= 80 ? "red" as const : threat.risk >= 65 ? "amber" as const : "cyan" as const,
  }));

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[#02040a] px-5 py-8 text-white md:px-8">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.14),transparent_34%),linear-gradient(180deg,#02040a_0%,#030712_100%)]" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6">
          <Header error={error} lastAction={lastAction} loading={loading} onRefresh={refresh} />
          <div className="grid gap-4 md:grid-cols-4">
            <Kpi label="Highest Risk" value={threats.highest_risk} />
            <Kpi label="Risk Avg" value={threats.risk_average} />
            <Kpi label="Detectors" value={threats.detectors.length} />
            <Kpi label="Auto Responses" value={threats.automated_responses.length} />
          </div>
          <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <ThreatRadar signals={radarSignals} title="Threat intelligence radar" />
            <AbuseTable busyAction={busyAction} onIsolateKey={() => isolateKey()} threats={threats.threats} />
          </div>
          <SessionRiskGrid busyAction={busyAction} identities={zeroTrust.identities} onRevokeSession={() => revokeSession()} />
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

function Header({ loading, error, lastAction, onRefresh }: { loading: boolean; error: string | null; lastAction: string | null; onRefresh: () => Promise<void> }) {
  return (
    <header className="rounded-[34px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-2xl">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-amber-100/70">Threat Intelligence Center</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.045em] text-white md:text-5xl">Detect brute force, API abuse, token replay, and insider misuse</h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/55">Deterministic detectors surface suspicious admins, geo anomalies, permission abuse, API spikes, credential stuffing, and lateral movement.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10" href={"/security/forensics" as Route}>Forensics</Link>
          <button className="rounded-2xl bg-amber-100 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60" disabled={loading} onClick={() => void onRefresh()} type="button">Refresh</button>
        </div>
      </div>
      {(error || lastAction) && <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/60">{error ? `Resilient mode: ${error}` : lastAction}</div>}
    </header>
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
