"use client";

import Link from "next/link";

import { BlockerPanel } from "@/components/ops/blocker-panel";
import { EscalationQueue } from "@/components/ops/escalation-queue";
import { ExecutiveKpis } from "@/components/ops/executive-kpis";
import { GovernancePanel } from "@/components/ops/governance-panel";
import { IncidentBoard } from "@/components/ops/incident-board";
import { ResolutionLedger } from "@/components/ops/resolution-ledger";
import { SlaTimers } from "@/components/ops/sla-timers";
import { TaskKanban } from "@/components/ops/task-kanban";
import { TeamGrid } from "@/components/ops/team-grid";
import { WorkflowQueue } from "@/components/ops/workflow-queue";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useOpsExecution } from "@/lib/ops/use-ops";

function LoadingExecution() {
  return (
    <div className="grid min-h-[70vh] place-items-center bg-slate-950 text-white">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl shadow-cyan-950/30">
        <div className="mx-auto h-12 w-12 animate-pulse rounded-full border border-cyan-300/40 bg-cyan-300/10" />
        <p className="mt-5 text-sm uppercase tracking-[0.32em] text-cyan-100/70">
          Loading autonomous operations engine
        </p>
      </div>
    </div>
  );
}

export default function OperationsExecutionPage() {
  const {
    snapshot,
    isLoading,
    isRefreshing,
    busyAction,
    error,
    usingFallback,
    refresh,
    runScenario,
    approveTask,
    pauseTask,
    reassignTask,
    closeIncident,
  } = useOpsExecution();

  const activeScenario = snapshot.workflow_queue[0]?.scenario ?? snapshot.scenarios[0]?.scenario_id ?? "hotel_kitchen_fire";

  if (isLoading && !snapshot) {
    return (
      <ProtectedWorkspaceShell>
        <LoadingExecution />
      </ProtectedWorkspaceShell>
    );
  }

  return (
    <ProtectedWorkspaceShell>
      <main className="px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-cyan-200/70">
                  Operations Execution Grid
                </p>
                <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">
                  Autonomous Operations Engine
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Sentra now turns crisis recommendations into governed execution: workflows, owners, SLA timers,
                  escalations, team allocation, and verified resolution closure.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => refresh()}
                  disabled={isRefreshing}
                  className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isRefreshing ? "Refreshing..." : "Refresh Execution"}
                </button>
                <Link
                  href="/ai/council"
                  className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  AI Council
                </Link>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Execution Mode</p>
                <p className="mt-2 text-lg font-semibold text-emerald-100">{snapshot.governance.mode.replaceAll("_", " ")}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Progress</p>
                <p className="mt-2 text-3xl font-black text-cyan-100">{snapshot.completion.progress}%</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Resolution Confidence</p>
                <p className="mt-2 text-3xl font-black text-white">{snapshot.completion.resolution_confidence}%</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Data Source</p>
                <p className="mt-2 text-lg font-semibold text-amber-100">{usingFallback ? "Local fallback" : "Ops backend"}</p>
              </div>
            </div>
          </header>

          {error ? (
            <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">
              {error}
            </div>
          ) : null}

          <div className="mt-6">
            <ExecutiveKpis snapshot={snapshot} />
          </div>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <IncidentBoard
              incidents={snapshot.active_incidents}
              scenarios={snapshot.scenarios}
              activeScenario={activeScenario}
              busyAction={busyAction}
              onRunScenario={runScenario}
            />
            <WorkflowQueue workflows={snapshot.workflow_queue} />
          </section>

          <div className="mt-6">
            <TaskKanban
              board={snapshot.task_board}
              busyAction={busyAction}
              onApprove={approveTask}
              onPause={pauseTask}
              onReassign={reassignTask}
            />
          </div>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <SlaTimers timers={snapshot.sla_timers} />
            <TeamGrid teams={snapshot.teams} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
            <BlockerPanel blockers={snapshot.blockers} />
            <EscalationQueue escalations={snapshot.escalation_queue} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <GovernancePanel
              governance={snapshot.governance}
              approvals={snapshot.approval_center}
              busyAction={busyAction}
              onApproveTask={approveTask}
            />
            <ResolutionLedger snapshot={snapshot} busyAction={busyAction} onCloseIncident={closeIncident} />
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}
