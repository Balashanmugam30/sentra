"use client";

import type { Route } from "next";
import Link from "next/link";

import { BoardSummary } from "@/components/ops/board-summary";
import { CeoActionPanel } from "@/components/ops/ceo-action-panel";
import { DemoStoryMode } from "@/components/ops/demo-story-mode";
import { ExecutiveKpisElite } from "@/components/ops/executive-kpis-elite";
import { StrategySimulator } from "@/components/ops/strategy-simulator";
import { TrustLedger } from "@/components/ops/trust-ledger";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useExecutiveOps } from "@/lib/ops/use-executive";

export default function OperationsExecutivePage() {
  const { snapshot, isRefreshing, busyAction, error, usingFallback, refresh, runAction, runSimulation } = useExecutiveOps();

  return (
    <ProtectedWorkspaceShell>
      <main className="px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-cyan-200/70">
                  Executive Operations Suite
                </p>
                <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">
                  Executive Operations Supremacy
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Sentra converts crisis operations into CEO-grade strategy: one-click command actions, board
                  simulations, financial exposure, reputation posture, recovery ETA, and export-ready narrative.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => refresh()}
                  disabled={isRefreshing}
                  className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20 disabled:opacity-60"
                >
                  {isRefreshing ? "Refreshing..." : "Refresh Executive"}
                </button>
                <Link
                  href={"/operations/resilience" as Route}
                  className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Resilience OS
                </Link>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Readiness</p>
                <p className="mt-2 text-3xl font-black text-emerald-100">{snapshot.summary.operational_readiness}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Exposure</p>
                <p className="mt-2 text-3xl font-black text-amber-100">{snapshot.summary.financial_exposure}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Board Confidence</p>
                <p className="mt-2 text-3xl font-black text-cyan-100">{snapshot.summary.board_confidence}</p>
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
            <ExecutiveKpisElite executive={snapshot} />
          </div>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <CeoActionPanel
              actions={snapshot.ceo_actions}
              selected={snapshot.selected_action}
              busyAction={busyAction}
              onRun={runAction}
            />
            <StrategySimulator
              options={snapshot.strategy_options}
              selected={snapshot.selected_simulation}
              busyAction={busyAction}
              onSimulate={runSimulation}
            />
          </section>

          <section className="mt-6">
            <BoardSummary
              summary={snapshot.board_summary}
              risks={snapshot.active_risks}
              financial={snapshot.financial_exposure}
              reputation={snapshot.reputation_exposure}
              teams={snapshot.teams_utilization}
              sla={snapshot.sla_health}
              tuner={snapshot.execution_tuner}
            />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
            <DemoStoryMode steps={snapshot.demo_story} />
            <TrustLedger ledger={snapshot.trust_ledger} />
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}
