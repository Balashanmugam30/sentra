import { formatCurrency, statusClass } from "@/lib/revenue/helpers";
import type { RevenueSubscription } from "@/lib/revenue/types";

type CurrentPlanCardProps = {
  subscription: RevenueSubscription;
  busyAction: string | null;
  onCancel: () => void;
  onReactivate: () => void;
};

export function CurrentPlanCard({ subscription, busyAction, onCancel, onReactivate }: CurrentPlanCardProps) {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/70">Current plan</p>
          <h2 className="mt-2 text-3xl font-black text-white">{subscription.plan_name}</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
            {subscription.customer} is billed {subscription.billing_interval} with renewal on {subscription.renewal_date}.
          </p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${statusClass(subscription.status)}`}>
          {subscription.status.replaceAll("_", " ")}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">MRR</p>
          <p className="mt-2 text-2xl font-black text-emerald-100">{formatCurrency(subscription.monthly_recurring_revenue)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">ACV</p>
          <p className="mt-2 text-2xl font-black text-cyan-100">{formatCurrency(subscription.annual_contract_value)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Proration</p>
          <p className="mt-2 text-2xl font-black text-amber-100">{formatCurrency(subscription.proration_preview)}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={busyAction === "cancel"}
          className="rounded-2xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/20 disabled:opacity-60"
        >
          {busyAction === "cancel" ? "Scheduling..." : "Cancel at renewal"}
        </button>
        <button
          type="button"
          onClick={onReactivate}
          disabled={busyAction === "reactivate"}
          className="rounded-2xl border border-emerald-300/25 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/20 disabled:opacity-60"
        >
          {busyAction === "reactivate" ? "Restoring..." : "Reactivate"}
        </button>
      </div>
    </article>
  );
}

