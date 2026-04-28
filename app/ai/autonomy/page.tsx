"use client";

import { ActionQueue } from "@/components/master/action-queue";
import { RecoveryCenter } from "@/components/master/recovery-center";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useMaster } from "@/lib/master/use-master";

export default function AIAutonomyPage() {
  const { autonomy, busyAction, runAutonomy, approveAutonomy, rollbackAutonomy } = useMaster();

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen bg-[radial-gradient(circle_at_75%_5%,rgba(34,211,238,0.16),transparent_34%),linear-gradient(135deg,#020617,#07111f_48%,#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.36em] text-cyan-200/70">Autonomy Core</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Governed Autonomous Command</h1>
            <p className="mt-4 max-w-3xl text-slate-300">Policy-aware execution modes, safety guardrails, human approval gates, and autonomous recovery intelligence.</p>
          </header>
          <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.95fr]">
            <ActionQueue actions={autonomy.action_queue} executions={autonomy.live_executions} busyAction={busyAction} onRun={runAutonomy} onApprove={approveAutonomy} onRollback={rollbackAutonomy} />
            <RecoveryCenter recovery={autonomy.recovery} guardrails={autonomy.guardrails} failoverEvents={autonomy.failover_events} outcomes={autonomy.closed_loop_outcomes} />
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

