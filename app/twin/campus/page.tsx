"use client";

import type { Route } from "next";
import Link from "next/link";

import { BuildingHealth } from "@/components/twin/building-health";
import { CampusGrid } from "@/components/twin/campus-grid";
import { ExecutiveSummary } from "@/components/twin/executive-summary";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useTwin } from "@/lib/twin/use-twin";

export default function TwinCampusPage() {
  const { campus, predictive, forecast, resources, loading, refresh } = useTwin();

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen bg-[radial-gradient(circle_at_12%_0%,rgba(99,102,241,0.2),transparent_31%),linear-gradient(135deg,#020617,#07111f_48%,#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-indigo-950/30 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-indigo-200/70">Multi-Building Command Twin</p>
                <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Campus & Network Mode</h1>
                <p className="mt-4 max-w-3xl text-slate-300">University, hospital, mall, hotel chain, industrial park, and smart city district state with cascading risk and shared resources.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => refresh()} className="rounded-2xl border border-indigo-300/30 bg-indigo-300/10 px-5 py-3 text-sm font-semibold text-indigo-50 transition hover:bg-indigo-300/20">
                  {loading ? "Syncing..." : "Refresh campus"}
                </button>
                <Link href={"/twin/resources" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Resources
                </Link>
              </div>
            </div>
          </header>
          <section className="mt-6">
            <ExecutiveSummary predictive={predictive} forecast={forecast} resources={resources} campus={campus} />
          </section>
          <section className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <CampusGrid campus={campus} />
            <BuildingHealth campus={campus} />
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

