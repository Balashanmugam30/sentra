"use client";

import type { Route } from "next";
import Link from "next/link";

import { ActionQueue } from "@/components/master/action-queue";
import { RecoveryCenter } from "@/components/master/recovery-center";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useMaster } from "@/lib/master/use-master";

export default function AutonomyMasterPage() {
  const { autonomy, loading, error, busyAction, lastAction, refresh, runAutonomy, approveAutonomy, rollbackAutonomy } = useMaster();

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_8%_0%,_rgba(34,211,238,0.22),_transparent_32%),radial-gradient(circle_at_88%_8%,_rgba(16,185,129,0.16),_transparent_30%),linear-gradient(135deg,_#020617,_#07111f_48%,_#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-cyan-200/70">Autonomous Execution Grid</p>
                <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">Autonomous Execution Grid</h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Approved AI council plans now execute through dispatch, communications, workflow triggers, failover, recovery, rollback, and audit-safe guardrails.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => refresh()} className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20">
                  {loading ? "Syncing..." : "Refresh grid"}
                </button>
                <Link href={"/ai/war-room" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  War Room
                </Link>
                <Link href={"/cloud/global" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Global Cloud
                </Link>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-5">
              {[
                ["Autonomy", `${autonomy.autonomy_score}%`],
                ["Actions", autonomy.actions_ready.toString()],
                ["Running", autonomy.running_executions.toString()],
                ["Approvals", autonomy.awaiting_approval.toString()],
                ["Recovery", `${autonomy.recovery_score}%`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </header>

          {error ? <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">{error}</div> : null}
          {lastAction ? <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4 text-sm text-cyan-100">{lastAction}</div> : null}

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
            <ActionQueue actions={autonomy.action_queue} executions={autonomy.live_executions} busyAction={busyAction} onRun={runAutonomy} onApprove={approveAutonomy} onRollback={rollbackAutonomy} />
            <RecoveryCenter recovery={autonomy.recovery} guardrails={autonomy.guardrails} failoverEvents={autonomy.failover_events} outcomes={autonomy.closed_loop_outcomes} />
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}
