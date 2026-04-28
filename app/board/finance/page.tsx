"use client";

import type { Route } from "next";
import Link from "next/link";

import { ARRChart } from "@/components/master/arr-chart";
import { RunwayMeter } from "@/components/master/runway-meter";
import { ValuationCard } from "@/components/master/valuation-card";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useMaster } from "@/lib/master/use-master";

export default function BoardFinancePage() {
  const { board, revenue, busyAction, forecast, valuation } = useMaster();

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,rgba(245,158,11,0.18),transparent_31%),linear-gradient(135deg,#020617,#07111f_48%,#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-amber-950/30 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-amber-200/70">Finance OS</p>
                <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Board Finance Intelligence</h1>
                <p className="mt-4 max-w-3xl text-slate-300">Revenue forecasting, churn radar, runway, burn, expansion ARR, valuation range, and strategic finance controls.</p>
              </div>
              <Link href={"/board/executive" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                Executive
              </Link>
            </div>
          </header>
          <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
            <ARRChart summary={board} revenue={revenue} />
            <RunwayMeter summary={board} />
          </section>
          <section className="mt-6">
            <ValuationCard summary={board} busyAction={busyAction} onSimulate={valuation} onForecast={forecast} />
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

