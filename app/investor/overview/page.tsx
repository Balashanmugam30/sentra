"use client";

import type { Route } from "next";
import Link from "next/link";

import { IpoScore } from "@/components/investor/ipo-score";
import { RunwayPanel } from "@/components/investor/runway-panel";
import { ValuationCard } from "@/components/investor/valuation-card";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useInvestor } from "@/lib/investor/use-investor";
import { formatCurrency } from "@/lib/revenue/helpers";

export default function InvestorOverviewPage() {
  const { summary, valuation, runway, ipo, busyAction, error, loading, refresh, addCash } = useInvestor();

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_0%,_rgba(34,211,238,0.18),_transparent_32%),radial-gradient(circle_at_86%_8%,_rgba(16,185,129,0.16),_transparent_30%),linear-gradient(135deg,_#020617,_#07111f_48%,_#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-cyan-200/70">Investor Command OS</p>
                <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">
                  Investor OS + Capital Engine
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Valuation, runway, Rule of 40, fundraising readiness, IPO posture, and board-level capital strategy in one institutional command layer.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => refresh()}
                  className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20"
                >
                  {loading ? "Syncing..." : "Refresh Investor OS"}
                </button>
                <Link href={"/investor/boardroom" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Boardroom
                </Link>
                <Link href={"/investor/fundraise" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Fundraise
                </Link>
                <Link href={"/investor/captable" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Cap Table
                </Link>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-4">
              {[
                ["ARR", formatCurrency(summary.ARR)],
                ["Growth", `${summary.growth_percent}%`],
                ["Runway", `${summary.runway_months}mo`],
                ["Base valuation", formatCurrency(summary.base_valuation)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </header>

          {error ? <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">{error}</div> : null}

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <ValuationCard summary={summary} valuation={valuation} />
            <RunwayPanel summary={summary} runway={runway} busyAction={busyAction} onAddCash={addCash} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
            <IpoScore ipo={ipo} />
            <article className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/70">Raise recommendation</p>
              <h2 className="mt-3 text-3xl font-black text-white">{summary.raise_recommendation}</h2>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {[
                  ["Rule of 40", summary.rule_of_40],
                  ["NRR", `${summary.net_revenue_retention}%`],
                  ["Readiness", `${summary.fundraising_readiness}/100`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
                    <p className="mt-2 text-2xl font-black text-white">{value}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}
