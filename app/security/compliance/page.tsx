"use client";

import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";

import { ComplianceScorecards } from "@/components/security/compliance-scorecards";
import { GapTable } from "@/components/security/gap-table";
import { ProcurementReadiness } from "@/components/security/procurement-readiness";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useSecurityTrust } from "@/lib/securitytrust/use-trust";

export default function SecurityCompliancePage() {
  const { compliance, loading, error, lastAction, refresh } = useSecurityTrust();
  return (
    <ProtectedWorkspaceShell>
      <TrustPageShell
        eyebrow="Compliance Readiness Center"
        title="Audit-ready controls for enterprise procurement"
        subtitle="SOC2, ISO27001, GDPR, HIPAA, DPDP India, and government procurement readiness with gaps, owners, and remediation ETAs."
        loading={loading}
        error={error}
        lastAction={lastAction}
        onRefresh={refresh}
      >
        <div className="grid gap-4 md:grid-cols-4">
          <Kpi label="Compliance Avg" value={`${compliance.compliance_average}%`} />
          <Kpi label="Control Pass" value={`${compliance.control_pass_rate}%`} />
          <Kpi label="Open Gaps" value={compliance.open_gaps} />
          <Kpi label="Remediation ETA" value={`${compliance.remediation_eta_days}d`} />
        </div>
        <ComplianceScorecards frameworks={compliance.frameworks} />
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <GapTable gaps={compliance.risk_priority_queue} />
          <ProcurementReadiness readiness={compliance.procurement_readiness} />
        </div>
      </TrustPageShell>
    </ProtectedWorkspaceShell>
  );
}

function TrustPageShell({ eyebrow, title, subtitle, loading, error, lastAction, onRefresh, children }: { eyebrow: string; title: string; subtitle: string; loading: boolean; error: string | null; lastAction: string | null; onRefresh: () => Promise<void>; children: ReactNode }) {
  return (
    <main className="min-h-screen overflow-hidden bg-[#02040a] px-5 py-8 text-white md:px-8">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(34,211,238,0.14),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.12),transparent_30%),linear-gradient(180deg,#02040a_0%,#030712_100%)]" />
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-[34px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-100/70">{eyebrow}</p>
              <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.045em] text-white md:text-5xl">{title}</h1>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-white/55">{subtitle}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10" href={"/security/trust-executive" as Route}>Executive Trust</Link>
              <button className="rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60" disabled={loading} onClick={() => void onRefresh()} type="button">
                {loading ? "Refreshing" : "Refresh"}
              </button>
            </div>
          </div>
          {(error || lastAction) && <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/60">{error ? `Resilient mode: ${error}` : lastAction}</div>}
        </header>
        {children}
      </div>
    </main>
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
