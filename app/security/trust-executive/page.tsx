"use client";

import Link from "next/link";
import type { Route } from "next";

import { LegalPanel } from "@/components/security/legal-panel";
import { ProcurementReadiness } from "@/components/security/procurement-readiness";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { TrustMeter } from "@/components/security/trust-meter";
import { useSecurityTrust } from "@/lib/securitytrust/use-trust";

export default function SecurityTrustExecutivePage() {
  const { executive, loading, error, lastAction, refresh } = useSecurityTrust();
  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[#02040a] px-5 py-8 text-white md:px-8">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(16,185,129,0.16),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(34,211,238,0.12),transparent_30%),linear-gradient(180deg,#02040a_0%,#030712_100%)]" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6">
          <header className="rounded-[34px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-2xl">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-emerald-100/70">Executive Trust Dashboard</p>
                <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.045em] text-white md:text-5xl">Procurement-ready confidence for enterprise and government buyers</h1>
                <p className="mt-4 max-w-3xl text-sm leading-6 text-white/55">{executive.board_summary}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10" href={"/security/compliance" as Route}>Compliance</Link>
                <button className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60" disabled={loading} onClick={() => void refresh()} type="button">Refresh</button>
              </div>
            </div>
            {(error || lastAction) && <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/60">{error ? `Resilient mode: ${error}` : lastAction}</div>}
          </header>

          <TrustMeter trust={executive.trust_index} />
          <div className="grid gap-4 md:grid-cols-5">
            <Kpi label="Security Maturity" value={`${executive.security_maturity}%`} />
            <Kpi label="Compliance" value={`${executive.compliance_confidence}%`} />
            <Kpi label="Buyer Ready" value={`${executive.buyer_readiness}%`} />
            <Kpi label="Legal Ready" value={`${executive.legal_readiness}%`} />
            <Kpi label="Blockers" value={executive.top_blockers.length} />
          </div>
          <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
            <ProcurementReadiness readiness={executive.procurement_readiness} />
            <LegalPanel items={executive.legal_items} />
          </div>
          <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Next 30 Days</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {executive.next_30_day_actions.map((action) => (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/65" key={action}>{action}</div>
              ))}
            </div>
          </section>
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
