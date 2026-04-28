"use client";

import type { Route } from "next";
import Link from "next/link";

import { DecisionSimulator } from "@/components/twin/decision-simulator";
import { ExecutiveSummary } from "@/components/twin/executive-summary";
import { FinancialImpact } from "@/components/twin/financial-impact";
import { SpreadForecast } from "@/components/twin/spread-forecast";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useTwin } from "@/lib/twin/use-twin";

export default function TwinExecutivePage() {
  const { predictive, forecast, resources, campus, compare, busyAction, lastAction, compareStrategies } = useTwin();

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen bg-[radial-gradient(circle_at_82%_0%,rgba(16,185,129,0.18),transparent_34%),linear-gradient(135deg,#020617,#07111f_48%,#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-emerald-950/30 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-emerald-200/70">Boardroom Twin Simulator</p>
                <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Executive Decision Twin</h1>
                <p className="mt-4 max-w-3xl text-slate-300">Compare containment, lockdown, phased evacuation, mutual aid, silent containment, and zone shutdown strategies by life safety, downtime, financial, and reputation impact.</p>
              </div>
              <Link href={"/twin/predictive" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                Predictive
              </Link>
            </div>
          </header>
          {lastAction ? <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">{lastAction}</div> : null}
          <section className="mt-6">
            <ExecutiveSummary predictive={predictive} forecast={forecast} resources={resources} campus={campus} />
          </section>
          <section className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <DecisionSimulator compare={compare} busyAction={busyAction} onCompare={compareStrategies} />
            <FinancialImpact predictive={predictive} compare={compare} />
          </section>
          <section className="mt-6">
            <SpreadForecast forecast={forecast} />
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

