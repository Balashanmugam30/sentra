"use client";

import Link from "next/link";
import type { Route } from "next";

import { ApprovalAnalytics } from "@/components/ops/approval-analytics";
import { ApprovalQueue } from "@/components/ops/approval-queue";
import { AutomationCenter } from "@/components/ops/automation-center";
import { DelegationPanel } from "@/components/ops/delegation-panel";
import { EscalationBoard } from "@/components/ops/escalation-board";
import { EvidencePanel } from "@/components/ops/evidence-panel";
import { GovernanceLoad } from "@/components/ops/governance-load";
import { PriorityBoard } from "@/components/ops/priority-board";
import { RetryHealth } from "@/components/ops/retry-health";
import { TrustPanel } from "@/components/ops/trust-panel";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useGovernance } from "@/lib/ops/use-governance";

export default function OperationsGovernancePage() {
  const {
    snapshot,
    isRefreshing,
    busyAction,
    error,
    usingFallback,
    refresh,
    approve,
    reject,
    delegate,
    escalate,
    runAutomation,
  } = useGovernance();

  return (
    <ProtectedWorkspaceShell>
      <main className="px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-cyan-200/70">
                  Operations Governance
                </p>
                <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">
                  Automation + Approval Governance OS
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  AI can act fast, but Sentra keeps governance in control: smart approval routing, escalation SLA,
                  delegation coverage, automation retries, and audit-grade evidence.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => refresh()}
                  disabled={isRefreshing}
                  className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isRefreshing ? "Refreshing..." : "Refresh Governance"}
                </button>
                <Link
                  href={"/operations/execution" as Route}
                  className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Execution Board
                </Link>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-5">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Pending</p>
                <p className="mt-2 text-3xl font-black text-white">{snapshot.summary.pending_count}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Critical</p>
                <p className="mt-2 text-3xl font-black text-rose-100">{snapshot.summary.critical_count}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Approved</p>
                <p className="mt-2 text-3xl font-black text-emerald-100">{snapshot.summary.approved_count}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Automation Ready</p>
                <p className="mt-2 text-3xl font-black text-cyan-100">{snapshot.summary.automation_ready}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Source</p>
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
            <ApprovalAnalytics analytics={snapshot.analytics} />
          </div>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <ApprovalQueue
              approvals={snapshot.pending_approvals}
              busyAction={busyAction}
              onApprove={approve}
              onReject={reject}
              onEscalate={escalate}
            />
            <PriorityBoard approvals={snapshot.priority_queue} timers={snapshot.sla_to_approve} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <EscalationBoard escalations={snapshot.escalated_decisions} busyAction={busyAction} onEscalate={escalate} />
            <DelegationPanel
              delegations={snapshot.delegations}
              approvals={snapshot.pending_approvals}
              busyAction={busyAction}
              onDelegate={delegate}
            />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <AutomationCenter actions={snapshot.automation} busyAction={busyAction} onRun={runAutomation} />
            <RetryHealth providers={snapshot.retry_health} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
            <GovernanceLoad workloads={snapshot.role_workload} />
            <TrustPanel snapshot={snapshot} />
          </section>

          <section className="mt-6">
            <EvidencePanel evidence={snapshot.evidence} ledger={snapshot.ledger} />
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}
