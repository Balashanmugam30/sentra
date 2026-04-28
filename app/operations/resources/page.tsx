"use client";

import type { Route } from "next";
import Link from "next/link";

import { ContinuityKpis } from "@/components/ops/continuity-kpis";
import { DeploymentMap } from "@/components/ops/deployment-map";
import { EtaBoard } from "@/components/ops/eta-board";
import { FatigueMonitor } from "@/components/ops/fatigue-monitor";
import { InventoryBoard } from "@/components/ops/inventory-board";
import { TeamAvailability } from "@/components/ops/team-availability";
import { VehicleBoard } from "@/components/ops/vehicle-board";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useResources } from "@/lib/ops/use-resources";

export default function OperationsResourcesPage() {
  const { snapshot, isRefreshing, busyAction, error, usingFallback, refresh, dispatch } = useResources();

  return (
    <ProtectedWorkspaceShell>
      <main className="px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-cyan-200/70">
                  Resource Command Center
                </p>
                <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">
                  Resource Deployment Command
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Sentra now coordinates field response: intelligent dispatch, equipment readiness, ETA prediction,
                  reserve activation, vehicle rerouting, shortage alerts, and fatigue-aware swaps.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => refresh()}
                  disabled={isRefreshing}
                  className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20 disabled:opacity-60"
                >
                  {isRefreshing ? "Refreshing..." : "Refresh Resources"}
                </button>
                <Link
                  href={"/operations/recovery" as Route}
                  className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Recovery OS
                </Link>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Avg ETA</p>
                <p className="mt-2 text-3xl font-black text-cyan-100">{snapshot.summary.avg_eta_minutes}m</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Readiness</p>
                <p className="mt-2 text-3xl font-black text-emerald-100">{snapshot.summary.readiness_score}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Shortages</p>
                <p className="mt-2 text-3xl font-black text-amber-100">{snapshot.summary.shortages}</p>
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
            <ContinuityKpis resources={snapshot} />
          </div>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <DeploymentMap
              incidents={snapshot.live_incidents}
              assignments={snapshot.deployment_map}
              busyAction={busyAction}
              onDispatch={dispatch}
            />
            <TeamAvailability teams={snapshot.teams} reserves={snapshot.reserves} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
            <InventoryBoard inventory={snapshot.inventory} alerts={snapshot.shortage_alerts} />
            <VehicleBoard vehicles={snapshot.vehicles} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <EtaBoard assignments={snapshot.eta_board} />
            <FatigueMonitor fatigue={snapshot.fatigue} />
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}
