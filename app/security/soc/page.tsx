"use client";

import Link from "next/link";
import type { Route } from "next";

import { IncidentQueue } from "@/components/security/incident-queue";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { SocKpis } from "@/components/security/soc-kpis";
import { ThreatRadar } from "@/components/security/threat-radar";
import { useSecurityDefense } from "@/lib/securitydefense/use-defense";

export default function SecuritySocPage() {
  const { summary, incidents, threats, busyAction, loading, error, lastAction, refresh, revokeSession, stepUpAuth, lockUser } = useSecurityDefense();
  const radarSignals = threats.threats.slice(0, 6).map((threat) => ({
    label: threat.category.replaceAll("_", " "),
    value: threat.risk,
    tone: threat.risk >= 80 ? "red" as const : threat.risk >= 65 ? "amber" as const : "cyan" as const,
  }));

  return (
    <ProtectedWorkspaceShell>
      <main className="px-5 py-8 text-white md:px-8">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(248,113,113,0.16),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(34,211,238,0.12),transparent_30%),linear-gradient(180deg,#02040a_0%,#030712_100%)]" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6">
          <DefenseHeader
            eyebrow="Security Operations Center"
            title="Zero trust threat defense command"
            subtitle="Live incident queue, deterministic detections, containment actions, threat radar, and analyst response posture for enterprise security reviews."
            loading={loading}
            error={error}
            lastAction={lastAction}
            onRefresh={refresh}
          />
          <SocKpis summary={summary} />
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <IncidentQueue busyAction={busyAction} incidents={incidents} onLockUser={() => lockUser()} onRevokeSession={() => revokeSession()} onStepUpAuth={() => stepUpAuth()} />
            <ThreatRadar signals={radarSignals} title="Live detector severity radar" />
          </div>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

function DefenseHeader({ eyebrow, title, subtitle, loading, error, lastAction, onRefresh }: { eyebrow: string; title: string; subtitle: string; loading: boolean; error: string | null; lastAction: string | null; onRefresh: () => Promise<void> }) {
  return (
    <header className="rounded-[34px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-red-100/70">{eyebrow}</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.045em] text-white md:text-6xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/55">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10" href={"/security/zero-trust" as Route}>Zero Trust</Link>
          <button className="rounded-2xl bg-red-100 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60" disabled={loading} onClick={() => void onRefresh()} type="button">
            {loading ? "Refreshing" : "Refresh SOC"}
          </button>
        </div>
      </div>
      {(error || lastAction) && <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/60">{error ? `Resilient mode: ${error}` : lastAction}</div>}
    </header>
  );
}
