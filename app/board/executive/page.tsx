"use client";

import type { Route } from "next";
import Link from "next/link";

import { ARRChart } from "@/components/master/arr-chart";
import { IPOScore } from "@/components/master/ipo-score";
import { ValuationCard } from "@/components/master/valuation-card";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useMaster } from "@/lib/master/use-master";

export default function BoardExecutivePage() {
  const { board, revenue, loading, error, busyAction, lastAction, refresh, forecast, valuation } = useMaster();
  const pack = board.summary[0];

  return (
    <ProtectedWorkspaceShell>
      <main className="px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-emerald-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-emerald-200/70">Board Intelligence OS</p>
                <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Executive Board Intelligence</h1>
                <p className="mt-4 max-w-3xl text-slate-300">ARR, runway, valuation, IPO readiness, churn radar, expansion pipeline, and board decisions wired into the operating layer.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => refresh()} className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 px-5 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-300/20">
                  {loading ? "Syncing..." : "Refresh board"}
                </button>
                <Link href={"/board/investors" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Investors
                </Link>
                <Link href={"/board/finance" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Finance
                </Link>
              </div>
            </div>
          </header>
          {error ? <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">{error}</div> : null}
          {lastAction ? <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">{lastAction}</div> : null}
          <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <ARRChart summary={board} revenue={revenue} />
            <ValuationCard summary={board} busyAction={busyAction} onSimulate={valuation} onForecast={forecast} />
          </section>
          <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <IPOScore summary={board} />
            <article className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-slate-950/20 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300/70">Board Summary</p>
              <h2 className="mt-2 text-2xl font-black text-white">{pack?.title ?? "Monthly board pack"}</h2>
              <p className="mt-4 rounded-3xl border border-emerald-300/15 bg-emerald-300/10 p-4 text-sm leading-6 text-emerald-50">{pack?.strategic_ask}</p>
              <p className="mt-3 rounded-3xl border border-amber-300/15 bg-amber-300/10 p-4 text-sm leading-6 text-amber-50">{pack?.top_risk}</p>
              <p className="mt-3 rounded-3xl border border-cyan-300/15 bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-50">{pack?.recommended_action}</p>
            </article>
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}
