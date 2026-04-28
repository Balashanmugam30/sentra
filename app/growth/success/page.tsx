"use client";

import type { Route } from "next";
import Link from "next/link";

import { CustomerHealth } from "@/components/growth/customer-health";
import { ExpansionPanel } from "@/components/growth/expansion-panel";
import { ForecastPanel } from "@/components/growth/forecast-panel";
import { RenewalBoard } from "@/components/growth/renewal-board";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { formatCurrency } from "@/lib/revenue/helpers";
import { useGrowth } from "@/lib/growth/use-growth";

export default function GrowthSuccessPage() {
  const { summary, customers, renewals, expansions, busyAction, error, loading, expandCustomer, refresh, saveCustomer } = useGrowth();

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_0%,_rgba(16,185,129,0.18),_transparent_30%),radial-gradient(circle_at_90%_10%,_rgba(245,158,11,0.16),_transparent_28%),linear-gradient(135deg,_#020617,_#07111f_48%,_#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-emerald-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-emerald-200/70">Customer Success OS</p>
                <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">
                  Retention + Expansion Command
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Account health, onboarding adoption, renewals, churn risk, sentiment, expansion plays, and QBR-ready value signals.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => refresh()} className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 px-5 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-300/20">
                  {loading ? "Syncing..." : "Refresh Success"}
                </button>
                <Link href={"/growth/crm" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  CRM OS
                </Link>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-5">
              {[
                ["Health", `${summary.customer_health_score}`],
                ["Renewals", formatCurrency(summary.renewal_pipeline)],
                ["Expansion", formatCurrency(summary.expansion_pipeline)],
                ["Churn risk", `${summary.churn_risk_accounts}`],
                ["Forecast", formatCurrency(summary.quarter_forecast)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </header>

          {error ? <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">{error}</div> : null}

          <section className="mt-6">
            <CustomerHealth customers={customers} busyAction={busyAction} onSave={saveCustomer} />
          </section>
          <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <RenewalBoard renewals={renewals} />
            <ExpansionPanel opportunities={expansions} busyAction={busyAction} onExpand={expandCustomer} />
          </section>
          <section className="mt-6">
            <ForecastPanel summary={summary} />
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

