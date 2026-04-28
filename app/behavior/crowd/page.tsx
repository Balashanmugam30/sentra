"use client";

import type { Route } from "next";
import Link from "next/link";

import { CorridorPressure } from "@/components/behavior/corridor-pressure";
import { CrowdHeatmap } from "@/components/behavior/crowd-heatmap";
import { ExitMonitor } from "@/components/behavior/exit-monitor";
import { FlowBoard } from "@/components/behavior/flow-board";
import { RouteEngine } from "@/components/behavior/route-engine";
import { SafezoneBoard } from "@/components/behavior/safezone-board";
import { StairLoad } from "@/components/behavior/stair-load";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useCrowd } from "@/lib/behavior/use-crowd";

export default function CrowdCommandPage() {
  const { crowd, loading, error, busyAction, lastAction, refresh, runSimulation, recomputeRoutes } = useCrowd();

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_8%_0%,_rgba(34,211,238,0.2),_transparent_32%),radial-gradient(circle_at_90%_12%,_rgba(244,63,94,0.16),_transparent_30%),linear-gradient(135deg,_#020617,_#07111f_48%,_#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-cyan-200/70">Crowd Dynamics Intelligence</p>
                <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">Crowd Dynamics Command Center</h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Predict flow, control bottlenecks, prevent stampede conditions, balance safe zones, and guide thousands through the safest evacuation paths.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => refresh()} className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20">
                  {loading ? "Syncing..." : "Refresh crowd"}
                </button>
                <button
                  type="button"
                  onClick={() => runSimulation("multi_floor_hotel_fire")}
                  disabled={busyAction === "simulate"}
                  className="rounded-2xl border border-rose-300/30 bg-rose-300/10 px-5 py-3 text-sm font-semibold text-rose-50 transition hover:bg-rose-300/20 disabled:opacity-60"
                >
                  {busyAction === "simulate" ? "Simulating..." : "Run simulation"}
                </button>
                <Link href={"/behavior/evacuation" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Evacuation View
                </Link>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-5">
              {[
                ["Occupancy", crowd.summary.total_occupancy.toLocaleString()],
                ["Avg Density", `${crowd.summary.avg_density}/100`],
                ["Flow", `${crowd.summary.avg_flow_people_per_min}/min`],
                ["Pressure", `${crowd.summary.max_corridor_pressure}/100`],
                ["Route Trust", `${crowd.summary.safe_route_confidence}%`],
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

          <section className="mt-6">
            <CrowdHeatmap zones={crowd.occupancy_grid} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <ExitMonitor exits={crowd.exit_pressure} />
            <RouteEngine routes={crowd.routes} busy={busyAction === "recompute"} onRecompute={() => recomputeRoutes("HOTEL-KITCHEN-B")} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <FlowBoard crowd={crowd} />
            <CorridorPressure corridors={crowd.corridor_pressure} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <StairLoad stairs={crowd.stairwell_load} elevators={crowd.elevator_logic} />
            <SafezoneBoard safeZones={crowd.safe_zones} />
          </section>

          <section className="mt-6 rounded-[2rem] border border-white/10 bg-black/25 p-5 shadow-2xl shadow-cyan-950/20">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Intervention controls</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                ["Throttle overloaded stairwell", "Meter Stairwell C and divert 22% flow to Service Stairwell"],
                ["Split ballroom wave", "Release groups in 90-second waves toward Event Wing Exit"],
                ["Reserve assisted lane", "Keep Fire Service Lift and east corridor available for mobility support"],
              ].map(([title, description]) => (
                <div key={title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="font-black text-white">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}
