"use client";

import type { Route } from "next";
import Link from "next/link";

import { FloorMap } from "@/components/twin/floor-map";
import { UtilityPanel } from "@/components/twin/utility-panel";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useTwin } from "@/lib/twin/use-twin";

export default function TwinFacilityPage() {
  const { facility, live, loading, refresh } = useTwin();

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen bg-[radial-gradient(circle_at_12%_0%,rgba(16,185,129,0.18),transparent_31%),linear-gradient(135deg,#020617,#07111f_48%,#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-emerald-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-emerald-200/70">Executive Building Twin</p>
                <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">{facility.facility.name}</h1>
                <p className="mt-4 max-w-3xl text-slate-300">All floors, utilities, elevators, stairwells, exits, safe zones, HVAC, power, and network posture for executive command.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => refresh()} className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 px-5 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-300/20">
                  {loading ? "Syncing..." : "Refresh facility"}
                </button>
                <Link href={"/twin/live" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Live twin
                </Link>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-5">
              {live.facilities.map((item) => (
                <div key={item.facility_id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.type}</p>
                  <p className="mt-2 text-sm font-black text-white">{item.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.floors} floors · risk {item.risk_score}</p>
                </div>
              ))}
            </div>
          </header>
          <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <UtilityPanel facility={facility} />
            <FloorMap floors={facility.floors} />
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

