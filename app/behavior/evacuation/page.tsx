"use client";

import type { Route } from "next";
import Link from "next/link";

import { EvacProgress } from "@/components/behavior/evac-progress";
import { ReentryPanel } from "@/components/behavior/reentry-panel";
import { RouteEngine } from "@/components/behavior/route-engine";
import { SafezoneBoard } from "@/components/behavior/safezone-board";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useCrowd } from "@/lib/behavior/use-crowd";

export default function EvacuationCommandPage() {
  const { crowd, evacuation, loading, error, busyAction, refresh, runSimulation, recomputeRoutes } = useCrowd();

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_8%_0%,_rgba(16,185,129,0.18),_transparent_32%),radial-gradient(circle_at_90%_12%,_rgba(34,211,238,0.16),_transparent_30%),linear-gradient(135deg,_#020617,_#07111f_48%,_#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-emerald-200/70">Executive Evacuation Center</p>
                <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">Mass Movement Control</h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Full evacuation time, cleared population, blocked zones, assistance queue, re-entry readiness, and recovery timing in one executive view.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => refresh()} className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 px-5 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-300/20">
                  {loading ? "Syncing..." : "Refresh evacuation"}
                </button>
                <button
                  type="button"
                  onClick={() => runSimulation("stairwell_pressure_event")}
                  disabled={busyAction === "simulate"}
                  className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20 disabled:opacity-60"
                >
                  Run evac sim
                </button>
                <Link href={"/behavior/crowd" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Crowd Command
                </Link>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-5">
              {[
                ["Full Evac", `${evacuation.estimated_full_evac_minutes}m`],
                ["Cleared", `${evacuation.people_cleared_percent}%`],
                ["Remaining", evacuation.people_remaining.toLocaleString()],
                ["Blocked", evacuation.blocked_zones.length.toString()],
                ["Assist Queue", evacuation.special_assistance_queue.toString()],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </header>

          {error ? <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">{error}</div> : null}

          <section className="mt-6">
            <EvacProgress evacuation={evacuation} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <RouteEngine routes={evacuation.best_exit_plans} busy={busyAction === "recompute"} onRecompute={() => recomputeRoutes("HOTEL-KITCHEN-B")} />
            <ReentryPanel evacuation={evacuation} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <SafezoneBoard safeZones={crowd.safe_zones} />
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Recovery timeline</p>
              <div className="mt-5 space-y-3">
                {evacuation.recovery_timeline.map((phase) => (
                  <article key={phase.phase} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-black text-white">{phase.phase}</p>
                        <p className="mt-1 text-sm text-slate-300">{phase.status}</p>
                      </div>
                      <span className="text-xl font-black text-emerald-100">{phase.confidence}%</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}
