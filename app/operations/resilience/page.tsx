"use client";

import type { Route } from "next";
import Link from "next/link";

import { AutohealFeed } from "@/components/ops/autoheal-feed";
import { ExecutiveKpisElite } from "@/components/ops/executive-kpis-elite";
import { LatencyRadar } from "@/components/ops/latency-radar";
import { RecoveryTimeline } from "@/components/ops/recovery-timeline";
import { SystemHealthGrid } from "@/components/ops/system-health-grid";
import { TrustLedger } from "@/components/ops/trust-ledger";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useResilience } from "@/lib/ops/use-resilience";

export default function OperationsResiliencePage() {
  const { snapshot, isRefreshing, busyAction, error, usingFallback, refresh, heal } = useResilience();

  return (
    <ProtectedWorkspaceShell>
      <main className="px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-cyan-200/70">
                  Resilience Operations OS
                </p>
                <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">
                  Autonomous Resilience Command Center
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Sentra now detects operational failure before humans notice, self-heals degraded systems, protects
                  crisis uptime, and forecasts collapse risk across workflows, queues, providers, and integrations.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => refresh()}
                  disabled={isRefreshing}
                  className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20 disabled:opacity-60"
                >
                  {isRefreshing ? "Refreshing..." : "Refresh Resilience"}
                </button>
                <Link
                  href={"/operations/executive" as Route}
                  className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Executive OS
                </Link>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Health</p>
                <p className="mt-2 text-3xl font-black text-emerald-100">{snapshot.summary.health_score}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Collapse Risk</p>
                <p className="mt-2 text-3xl font-black text-amber-100">{snapshot.summary.collapse_risk}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Uptime Protection</p>
                <p className="mt-2 text-3xl font-black text-cyan-100">{snapshot.summary.uptime_protection}</p>
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
            <ExecutiveKpisElite resilience={snapshot} />
          </div>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <SystemHealthGrid
              health={snapshot.system_health}
              failures={snapshot.api_failures}
              queues={snapshot.queue_pressure}
              breakers={snapshot.circuit_breakers}
            />
            <AutohealFeed actions={snapshot.auto_heal_actions} busyAction={busyAction} onHeal={heal} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
            <LatencyRadar
              latency={snapshot.latency_radar}
              integrations={snapshot.integration_health}
              retries={snapshot.retry_engine}
              workflowFailures={snapshot.workflow_failures}
              forecasts={snapshot.failure_forecast}
            />
            <RecoveryTimeline events={snapshot.recovery_timeline} />
          </section>

          <section className="mt-6">
            <TrustLedger ledger={snapshot.trust_ledger} />
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}
