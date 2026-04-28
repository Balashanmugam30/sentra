"use client";

import type { Route } from "next";
import Link from "next/link";

import { FinanceAlerts } from "@/components/revenue/finance-alerts";
import { ForecastChart } from "@/components/revenue/forecast-chart";
import { MrrChart } from "@/components/revenue/mrr-chart";
import { TopCustomers } from "@/components/revenue/top-customers";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { formatCurrency } from "@/lib/revenue/helpers";
import { useRevenue } from "@/lib/revenue/use-revenue";

export default function RevenueExecutivePage() {
  const { snapshot, isRefreshing, error, usingFallback, refresh } = useRevenue();
  const summary = snapshot.summary;

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_18%_0%,_rgba(34,211,238,0.16),_transparent_28%),radial-gradient(circle_at_80%_10%,_rgba(16,185,129,0.18),_transparent_30%),linear-gradient(135deg,_#020617,_#07111f_48%,_#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-cyan-200/70">
                  Board Revenue Intelligence
                </p>
                <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">
                  Executive Revenue Dashboard
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">{summary.investor_summary}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => refresh()}
                  disabled={isRefreshing}
                  className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20 disabled:opacity-60"
                >
                  {isRefreshing ? "Refreshing..." : "Refresh Revenue"}
                </button>
                <Link
                  href={"/revenue/billing" as Route}
                  className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Billing Command
                </Link>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-4 xl:grid-cols-8">
              {[
                ["MRR", formatCurrency(summary.mrr)],
                ["ARR", formatCurrency(summary.arr)],
                ["NRR", `${summary.net_revenue_retention}%`],
                ["Churn", `${summary.churn_percent}%`],
                ["Expansion", formatCurrency(summary.expansion_mrr)],
                ["ARPU", formatCurrency(summary.arpu)],
                ["Margin", `${summary.gross_margin_percent}%`],
                ["Source", usingFallback ? "Fallback" : "Live"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{label}</p>
                  <p className="mt-2 text-xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </header>

          {error ? (
            <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">
              {error}
            </div>
          ) : null}

          <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
            <MrrChart summary={summary} />
            <ForecastChart forecast={snapshot.forecast} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <TopCustomers customers={snapshot.customers} />
            <FinanceAlerts alerts={snapshot.alerts} />
          </section>

          <section className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              ["Renewal pipeline", formatCurrency(summary.renewal_pipeline), "Revenue already in renewal motion"],
              ["Overdue revenue", formatCurrency(summary.overdue_revenue), "Collections exposure under control"],
              ["LTV estimate", formatCurrency(summary.ltv_estimate), "Enterprise retention-driven value"],
              ["Active customers", `${summary.active_customers}`, "Seeded tenants monetized"],
            ].map(([label, value, copy]) => (
              <article key={label} className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-slate-950/20 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</p>
                <p className="mt-3 text-3xl font-black text-white">{value}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{copy}</p>
              </article>
            ))}
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

