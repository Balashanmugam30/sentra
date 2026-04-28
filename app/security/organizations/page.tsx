"use client";

import Link from "next/link";
import type { Route } from "next";

import { OrgGrid } from "@/components/security/org-grid";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { SecurityScore } from "@/components/security/security-score";
import { useSecurityCenter } from "@/lib/securitycenter/use-security";

export default function SecurityOrganizationsPage() {
  const { orgs, summary, busyAction, loading, error, lastAction, createOrg, switchOrg, refresh } = useSecurityCenter();
  const seatsUsed = orgs.reduce((total, org) => total + org.seats_used, 0);
  const seatsTotal = orgs.reduce((total, org) => total + org.seats_total, 0);

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[#02040a] px-5 py-8 text-white md:px-8">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(16,185,129,0.13),transparent_32%),linear-gradient(180deg,#02040a_0%,#030712_100%)]" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6">
          <header className="rounded-[34px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-2xl">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-emerald-100/70">Organization Security</p>
                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-white md:text-5xl">Tenant workspaces with board-grade isolation</h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-white/55">
                  Workspace owners, SSO readiness, seat limits, billing tier, and tenant risk are visible without cross-tenant leakage.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10" href={"/security/sessions" as Route}>
                  Sessions
                </Link>
                <button className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60" disabled={loading} onClick={() => void refresh()} type="button">
                  Refresh
                </button>
              </div>
            </div>
            {(error || lastAction) && <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/60">{error ? `Resilient mode: ${error}` : lastAction}</div>}
          </header>

          <div className="grid gap-4 md:grid-cols-4">
            <Kpi label="Organizations" value={orgs.length} />
            <Kpi label="Seats Used" value={`${seatsUsed}/${seatsTotal}`} />
            <Kpi label="SSO Ready" value={summary.sso_ready_orgs} />
            <Kpi label="Avg Risk" value={summary.average_org_risk} />
          </div>

          <SecurityScore averageOrgRisk={summary.average_org_risk} averageSessionRisk={summary.average_session_risk} score={summary.security_score} />
          <OrgGrid busyAction={busyAction} onCreate={() => createOrg()} onSwitch={switchOrg} orgs={orgs} />
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
