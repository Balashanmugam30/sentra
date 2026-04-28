"use client";

import Link from "next/link";
import type { Route } from "next";

import { AlertsFeed } from "@/components/security/alerts-feed";
import { DeviceBoard } from "@/components/security/device-board";
import { MfaMeter } from "@/components/security/mfa-meter";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { RoleMatrix } from "@/components/security/role-matrix";
import { SecurityScore } from "@/components/security/security-score";
import { useSecurityCenter } from "@/lib/securitycenter/use-security";

export default function SecurityAccessPage() {
  const { summary, sessions, roles, loading, error, lastAction, refresh } = useSecurityCenter();
  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[#02040a] px-5 py-8 text-white md:px-8">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_80%_15%,rgba(16,185,129,0.1),transparent_30%),linear-gradient(180deg,#02040a_0%,#030712_100%)]" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6">
          <SecurityHeader
            eyebrow="Identity Command Center"
            title="Access security foundation for enterprise buyers"
            subtitle="RBAC, MFA, SSO readiness, tenant isolation, suspicious login intelligence, and session controls in one startup-grade command center."
            loading={loading}
            error={error}
            lastAction={lastAction}
            onRefresh={refresh}
          />

          <div className="grid gap-4 md:grid-cols-5">
            <Kpi label="Active Users" value={summary.active_users} />
            <Kpi label="Organizations" value={summary.organizations} />
            <Kpi label="Sessions Online" value={summary.sessions_online} />
            <Kpi label="MFA Coverage" value={`${summary.mfa_coverage}%`} />
            <Kpi label="Security Score" value={`${summary.security_score.score}%`} accent />
          </div>

          <SecurityScore
            averageOrgRisk={summary.average_org_risk}
            averageSessionRisk={summary.average_session_risk}
            score={summary.security_score}
          />

          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="grid gap-6">
              <MfaMeter summary={summary} />
              <RoleMatrix roles={roles.length ? roles : summary.roles} />
            </div>
            <div className="grid gap-6">
              <AlertsFeed alerts={summary.recent_alerts} />
              <DeviceBoard sessions={sessions} />
            </div>
          </div>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

function SecurityHeader({
  eyebrow,
  title,
  subtitle,
  loading,
  error,
  lastAction,
  onRefresh,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  loading: boolean;
  error: string | null;
  lastAction: string | null;
  onRefresh: () => Promise<void>;
}) {
  return (
    <header className="rounded-[34px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-100/70">{eyebrow}</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.045em] text-white md:text-6xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/55">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10" href={"/security/users" as Route}>
            Manage Users
          </Link>
          <button
            className="rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60"
            disabled={loading}
            onClick={() => void onRefresh()}
            type="button"
          >
            {loading ? "Refreshing" : "Refresh"}
          </button>
        </div>
      </div>
      {(error || lastAction) && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/60">
          {error ? `Resilient mode: ${error}` : lastAction}
        </div>
      )}
    </header>
  );
}

function Kpi({ label, value, accent = false }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className={["rounded-3xl border p-5 backdrop-blur-xl", accent ? "border-cyan-200/20 bg-cyan-300/10" : "border-white/10 bg-white/[0.045]"].join(" ")}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">{label}</p>
      <p className="mt-3 font-mono text-3xl text-white">{value}</p>
    </div>
  );
}
