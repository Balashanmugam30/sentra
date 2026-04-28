"use client";

import type { Route } from "next";
import Link from "next/link";

import { ScenarioLauncher } from "@/components/twin/scenario-launcher";
import { ReplayTimeline } from "@/components/twin/replay-timeline";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useTwin } from "@/lib/twin/use-twin";

export default function TwinTrainingPage() {
  const { scenarios, replay, busyAction, lastAction, simulate } = useTwin();

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen bg-[radial-gradient(circle_at_12%_0%,rgba(245,158,11,0.2),transparent_31%),linear-gradient(135deg,#020617,#07111f_48%,#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-amber-950/30 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-amber-200/70">Scenario Trainer</p>
                <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Digital Twin Training Simulator</h1>
                <p className="mt-4 max-w-3xl text-slate-300">Fire, gas, blocked exit, panic surge, power failure, cyber-fire combo, and multi-floor incident drills with deterministic outcomes.</p>
              </div>
              <Link href={"/twin/live" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                Live twin
              </Link>
            </div>
          </header>
          {lastAction ? <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">{lastAction}</div> : null}
          <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
            <ScenarioLauncher scenarios={scenarios} busyAction={busyAction} onSimulate={simulate} />
            <ReplayTimeline events={replay.events} />
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

