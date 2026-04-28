import { formatCurrency, statusClass } from "@/lib/revenue/helpers";
import type { FinanceAlert } from "@/lib/revenue/types";

type FinanceAlertsProps = {
  alerts: FinanceAlert[];
};

export function FinanceAlerts({ alerts }: FinanceAlertsProps) {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-rose-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-200/70">Finance alerts</p>
      <div className="mt-4 space-y-3">
        {alerts.map((alert) => (
          <div key={alert.alert_id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{alert.title}</p>
                <p className="text-xs text-slate-500">{alert.customer} · {alert.type.replaceAll("_", " ")}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${statusClass(alert.severity)}`}>{alert.severity}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">{alert.recommended_action}</p>
            <p className="mt-2 text-sm font-black text-amber-100">Value at risk: {formatCurrency(alert.value_at_risk)}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

