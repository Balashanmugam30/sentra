"use client";

import Link from "next/link";
import type { Route } from "next";

import { ForensicLedger } from "@/components/security/forensic-ledger";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useSecurityDefense } from "@/lib/securitydefense/use-defense";

export default function SecurityForensicsPage() {
  const { forensics, loading, error, lastAction, refresh } = useSecurityDefense();
  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[#02040a] px-5 py-8 text-white md:px-8">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(34,211,238,0.14),transparent_32%),linear-gradient(180deg,#02040a_0%,#030712_100%)]" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6">
          <header className="rounded-[34px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-2xl">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-100/70">Forensic Audit Command</p>
                <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.045em] text-white md:text-5xl">Evidence chain for suspicious actions and privileged access</h1>
                <p className="mt-4 max-w-3xl text-sm leading-6 text-white/55">Timeline explorer with actor, organization, target, IP region, device, result, severity, and mock chain-hash verification.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10" href={"/security/soc" as Route}>SOC</Link>
                <button className="rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60" disabled={loading} onClick={() => void refresh()} type="button">Refresh</button>
              </div>
            </div>
            {(error || lastAction) && <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/60">{error ? `Resilient mode: ${error}` : lastAction}</div>}
          </header>

          <div className="grid gap-4 md:grid-cols-4">
            <Kpi label="Timeline Events" value={forensics.timeline_events} />
            <Kpi label="Privileged Actions" value={forensics.privileged_actions} />
            <Kpi label="Chain Integrity" value={`${forensics.chain_integrity}%`} />
            <Kpi label="Latest Hash" value={forensics.latest_hash} compact />
          </div>
          <ForensicLedger forensics={forensics} />
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

function Kpi({ label, value, compact = false }: { label: string; value: number | string; compact?: boolean }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">{label}</p>
      <p className={["mt-3 font-mono text-white", compact ? "text-base" : "text-3xl"].join(" ")}>{value}</p>
    </div>
  );
}
