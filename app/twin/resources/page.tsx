"use client";

import type { Route } from "next";
import Link from "next/link";

import { ReserveMeter } from "@/components/twin/reserve-meter";
import { RouteAI } from "@/components/twin/route-ai";
import { SwarmBoard } from "@/components/twin/swarm-board";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useTwin } from "@/lib/twin/use-twin";

export default function TwinResourcesPage() {
  const { liveRoutes, resources, busyAction, lastAction, computeRoute, rebalanceResources } = useTwin();

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,rgba(34,197,94,0.18),transparent_31%),linear-gradient(135deg,#020617,#07111f_48%,#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-emerald-950/30 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-emerald-200/70">Swarm Coordination Layer</p>
                <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Resources & Autonomous Routes</h1>
                <p className="mt-4 max-w-3xl text-slate-300">AI allocator for guards, medics, fire units, hazmat, drones, vehicles, reserve teams, and live route optimization.</p>
              </div>
              <Link href={"/twin/campus" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                Campus
              </Link>
            </div>
          </header>
          {lastAction ? <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">{lastAction}</div> : null}
          <section className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <SwarmBoard resources={resources} busyAction={busyAction} onRebalance={rebalanceResources} />
            <ReserveMeter resources={resources} />
          </section>
          <section className="mt-6">
            <RouteAI routes={liveRoutes} busyAction={busyAction} onCompute={computeRoute} />
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

