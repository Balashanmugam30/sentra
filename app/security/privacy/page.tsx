"use client";

import Link from "next/link";
import type { Route } from "next";

import { PrivacyMap } from "@/components/security/privacy-map";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { RetentionBoard } from "@/components/security/retention-board";
import { useSecurityTrust } from "@/lib/securitytrust/use-trust";

export default function SecurityPrivacyPage() {
  const { privacy, loading, error, lastAction, refresh } = useSecurityTrust();
  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[#02040a] px-5 py-8 text-white md:px-8">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(16,185,129,0.14),transparent_32%),linear-gradient(180deg,#02040a_0%,#030712_100%)]" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6">
          <Header error={error} lastAction={lastAction} loading={loading} onRefresh={refresh} />
          <div className="grid gap-4 md:grid-cols-5">
            <Kpi label="PII Exposure" value={privacy.pii_exposure_score} />
            <Kpi label="Masking" value={`${privacy.masking_coverage}%`} />
            <Kpi label="Encryption" value={`${privacy.encryption_posture}%`} />
            <Kpi label="Consent" value={`${privacy.consent_posture}%`} />
            <Kpi label="Incidents" value={privacy.privacy_incidents} />
          </div>
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <PrivacyMap privacy={privacy} />
            <RetentionBoard queues={privacy.queues} />
          </div>
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
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-emerald-100/70">Privacy Control Center</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.045em] text-white md:text-5xl">Data minimization, masking, retention, and export readiness</h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/55">Classify fields, track PII exposure, manage deletion and export queues, and prove privacy posture for buyers.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10" href={"/security/evidence" as Route}>Evidence</Link>
          <button className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60" disabled={loading} onClick={() => void onRefresh()} type="button">Refresh</button>
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
