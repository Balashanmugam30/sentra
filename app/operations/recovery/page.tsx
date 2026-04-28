"use client";

import type { Route } from "next";
import Link from "next/link";

import { ContinuityKpis } from "@/components/ops/continuity-kpis";
import { RecoveryBoard } from "@/components/ops/recovery-board";
import { ReopenChecklist } from "@/components/ops/reopen-checklist";
import { VendorPanel } from "@/components/ops/vendor-panel";
import { BroadcastFeed } from "@/components/ops/broadcast-feed";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useRecovery } from "@/lib/ops/use-recovery";

export default function OperationsRecoveryPage() {
  const { snapshot, isRefreshing, busyAction, error, usingFallback, refresh, runScenario, approveGate } = useRecovery();

  return (
    <ProtectedWorkspaceShell>
      <main className="px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-cyan-200/70">
                  Recovery Command Center
                </p>
                <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">
                  Recovery + Business Continuity OS
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Sentra now owns the post-crisis lifecycle: damage assessment, utility restoration, compliance,
                  vendor coordination, reopen governance, occupancy return, and executive continuity KPIs.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => refresh()}
                  disabled={isRefreshing}
                  className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20 disabled:opacity-60"
                >
                  {isRefreshing ? "Refreshing..." : "Refresh Recovery"}
                </button>
                <Link
                  href={"/operations/resources" as Route}
                  className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Resource OS
                </Link>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Progress</p>
                <p className="mt-2 text-3xl font-black text-cyan-100">{snapshot.summary.progress}%</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Continuity</p>
                <p className="mt-2 text-3xl font-black text-emerald-100">{snapshot.kpis.continuity_score}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Awaiting Approval</p>
                <p className="mt-2 text-3xl font-black text-amber-100">{snapshot.summary.awaiting_approval}</p>
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
            <ContinuityKpis recovery={snapshot} />
          </div>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <RecoveryBoard
              scenarios={snapshot.scenarios}
              damage={snapshot.damage_assessment}
              tasks={snapshot.tasks}
              activeScenario={snapshot.scenario}
              busyAction={busyAction}
              onRunScenario={runScenario}
            />
            <ReopenChecklist gates={snapshot.reopen_checklist} busyAction={busyAction} onApprove={approveGate} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
            <VendorPanel vendors={snapshot.vendor_coordination} waves={snapshot.occupancy_return_plan} />
            <BroadcastFeed feed={snapshot.ledger} />
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}
