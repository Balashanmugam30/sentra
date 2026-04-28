"use client";

import { RecoveryCenter } from "@/components/master/recovery-center";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useMaster } from "@/lib/master/use-master";

export default function AIRecoveryPage() {
  const { autonomy } = useMaster();

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen bg-[radial-gradient(circle_at_15%_0%,rgba(16,185,129,0.18),transparent_31%),linear-gradient(135deg,#020617,#07111f_48%,#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-emerald-950/30 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.36em] text-emerald-200/70">Recovery Intelligence</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Closed-Loop Recovery</h1>
            <p className="mt-4 max-w-3xl text-slate-300">Every autonomous action is scored, verified, recovered, and auditable before the system declares stability.</p>
          </header>
          <div className="mt-6">
            <RecoveryCenter recovery={autonomy.recovery} guardrails={autonomy.guardrails} failoverEvents={autonomy.failover_events} outcomes={autonomy.closed_loop_outcomes} />
          </div>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

