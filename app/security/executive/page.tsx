"use client";

import Link from "next/link";
import type { Route } from "next";

import { ComplianceMeter } from "@/components/security/compliance-meter";
import { ExecutiveRisk } from "@/components/security/executive-risk";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { ThreatRadar } from "@/components/security/threat-radar";
import { useSecurityDefense } from "@/lib/securitydefense/use-defense";

export default function SecurityExecutivePage() {
  const { executive, summary, loading, error, lastAction, refresh } = useSecurityDefense();
  const radarSignals = executive.top_threats.map((threat) => ({
    label: threat.category.replaceAll("_", " "),
    value: threat.risk,
    tone: threat.risk >= 80 ? "red" as const : "amber" as const,
  }));

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[#02040a] px-5 py-8 text-white md:px-8">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(16,185,129,0.14),transparent_32%),radial-gradient(circle_at_80%_18%,rgba(34,211,238,0.1),transparent_30%),linear-gradient(180deg,#02040a_0%,#030712_100%)]" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6">
          <header className="rounded-[34px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-2xl">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-emerald-100/70">Executive Cyber Summary</p>
                <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.045em] text-white md:text-5xl">Security maturity, compliance confidence, and CISO-ready posture</h1>
                <p className="mt-4 max-w-3xl text-sm leading-6 text-white/55">Boardroom cyber view for enterprise CIOs, CISOs, hospitals, universities, and government pilots.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10" href={"/security/soc" as Route}>Open SOC</Link>
                <button className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60" disabled={loading} onClick={() => void refresh()} type="button">Refresh</button>
              </div>
            </div>
            {(error || lastAction) && <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/60">{error ? `Resilient mode: ${error}` : lastAction}</div>}
          </header>

          <ExecutiveRisk executive={executive} />
          <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <ComplianceMeter compliance={executive.compliance_score} />
            <ThreatRadar signals={radarSignals} title="Board-level top threat radar" />
          </div>
          <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Executive posture link</p>
            <p className="mt-2 text-sm leading-6 text-white/60">
              SOC threat level is <span className="font-semibold text-white">{summary.threat_level}</span> with {summary.auto_containment_count} automated containments and {summary.policy_coverage}% policy coverage.
            </p>
          </div>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}
