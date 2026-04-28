"use client";

import type { Route } from "next";
import Link from "next/link";

import { CurrentPlanCard } from "@/components/revenue/current-plan-card";
import { FinanceAlerts } from "@/components/revenue/finance-alerts";
import { ForecastChart } from "@/components/revenue/forecast-chart";
import { InvoiceLedger } from "@/components/revenue/invoice-ledger";
import { MrrChart } from "@/components/revenue/mrr-chart";
import { PaymentHealth } from "@/components/revenue/payment-health";
import { QuotaUsageCard } from "@/components/revenue/quota-usage-card";
import { RenewalCalendar } from "@/components/revenue/renewal-calendar";
import { SeatUsageCard } from "@/components/revenue/seat-usage-card";
import { TopCustomers } from "@/components/revenue/top-customers";
import { UpgradeCenter } from "@/components/revenue/upgrade-center";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { formatCurrency } from "@/lib/revenue/helpers";
import { useRevenue } from "@/lib/revenue/use-revenue";

export default function RevenueBillingPage() {
  const {
    snapshot,
    isRefreshing,
    busyAction,
    error,
    usingFallback,
    addSeats,
    cancelSubscription,
    downgradePlan,
    markInvoicePaid,
    reactivateSubscription,
    refresh,
    removeSeats,
    upgradePlan,
  } = useRevenue();

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_0%,_rgba(16,185,129,0.18),_transparent_30%),radial-gradient(circle_at_88%_8%,_rgba(34,211,238,0.16),_transparent_28%),linear-gradient(135deg,_#020617,_#06111f_45%,_#020617)] px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-emerald-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-emerald-200/70">
                  Revenue Billing OS
                </p>
                <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">
                  Revenue Core + Billing OS
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                  Plan licensing, seat expansion, usage billing, invoice collections, renewals, upgrade paths, and
                  finance alerts in one commercialization command center.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => refresh()}
                  disabled={isRefreshing}
                  className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 px-5 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-300/20 disabled:opacity-60"
                >
                  {isRefreshing ? "Refreshing..." : "Refresh Billing"}
                </button>
                <Link
                  href={"/revenue/executive" as Route}
                  className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Executive Revenue
                </Link>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-5">
              {[
                ["MRR", formatCurrency(snapshot.summary.mrr)],
                ["ARR", formatCurrency(snapshot.summary.arr)],
                ["NRR", `${snapshot.summary.net_revenue_retention}%`],
                ["Collections", `${snapshot.summary.collections_ratio}%`],
                ["Source", usingFallback ? "Local fallback" : "Revenue backend"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </header>

          {error ? (
            <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">
              {error}
            </div>
          ) : null}

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <CurrentPlanCard
              subscription={snapshot.subscription}
              busyAction={busyAction}
              onCancel={cancelSubscription}
              onReactivate={reactivateSubscription}
            />
            <SeatUsageCard
              seats={snapshot.subscription.seats}
              busyAction={busyAction}
              onAddSeats={() => addSeats(10)}
              onRemoveSeats={() => removeSeats(5)}
            />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <QuotaUsageCard usage={snapshot.usage} />
            <InvoiceLedger invoices={snapshot.invoices} busyAction={busyAction} onMarkPaid={markInvoicePaid} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <PaymentHealth payment={snapshot.payment_health} />
            <RenewalCalendar renewals={snapshot.renewals} />
          </section>

          <section className="mt-6">
            <UpgradeCenter
              plans={snapshot.plans}
              currentPlanKey={snapshot.subscription.plan_key}
              busyAction={busyAction}
              onUpgrade={upgradePlan}
              onDowngrade={downgradePlan}
            />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
            <MrrChart summary={snapshot.summary} />
            <ForecastChart forecast={snapshot.forecast} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <FinanceAlerts alerts={snapshot.alerts} />
            <TopCustomers customers={snapshot.customers} />
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}
