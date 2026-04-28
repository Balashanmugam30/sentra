"use client";

import type { Route } from "next";
import Link from "next/link";

import { InvestorPipeline } from "@/components/investor/investor-pipeline";
import { RaiseSimulator } from "@/components/investor/raise-simulator";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useInvestor } from "@/lib/investor/use-investor";
import { formatCurrency } from "@/lib/revenue/helpers";

export default function InvestorFundraisePage() {
  const { summary, runway, investors, busyAction, error, loading, refresh, addInvestor, runScenario, updateFund } = useInvestor();

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_0%,_rgba(59,130,246,0.18),_transparent_32%),radial-gradient(circle_at_88%_10%,_rgba(16,185,129,0.16),_transparent_30%),linear-gradient(135deg,_#020617,_#07111f_48%,_#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-blue-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-blue-200/70">Fundraising OS</p>
                <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">
                  Investor Pipeline + Conviction Engine
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Active funds, partner paths, probability-weighted raise, next actions, thesis fit, and institutional fundraising motion.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => refresh()} className="rounded-2xl border border-blue-300/30 bg-blue-300/10 px-5 py-3 text-sm font-semibold text-blue-50 transition hover:bg-blue-300/20">
                  {loading ? "Syncing..." : "Refresh Pipeline"}
                </button>
                <button type="button" onClick={addInvestor} disabled={busyAction === "add-investor"} className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 px-5 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-300/20 disabled:opacity-60">
                  Add strategic fund
                </button>
                <Link href={"/investor/overview" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Overview
                </Link>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-4">
              {[
                ["Active funds", summary.investor_count],
                ["Weighted raise", formatCurrency(summary.weighted_raise)],
                ["Base valuation", formatCurrency(summary.base_valuation)],
                ["Deadline", summary.next_raise_deadline],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </header>

          {error ? <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">{error}</div> : null}

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <InvestorPipeline investors={investors} busyAction={busyAction} onUpdateFund={updateFund} />
            <RaiseSimulator summary={summary} runway={runway} busyAction={busyAction} onRunScenario={runScenario} />
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

