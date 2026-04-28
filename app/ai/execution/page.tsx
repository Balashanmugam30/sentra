"use client";

import { ActionQueue } from "@/components/master/action-queue";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useMaster } from "@/lib/master/use-master";

export default function AIExecutionPage() {
  const { autonomy, busyAction, runAutonomy, approveAutonomy, rollbackAutonomy } = useMaster();

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen bg-[linear-gradient(135deg,#020617,#07111f_48%,#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.36em] text-cyan-200/70">AI Execution</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">AI Decisions To Actions</h1>
            <p className="mt-4 max-w-3xl text-slate-300">The council output becomes controlled execution: dispatch, communications, zones, recovery, retry, rollback, and evidence capture.</p>
          </header>
          <div className="mt-6">
            <ActionQueue actions={autonomy.action_queue} executions={autonomy.live_executions} busyAction={busyAction} onRun={runAutonomy} onApprove={approveAutonomy} onRollback={rollbackAutonomy} />
          </div>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

