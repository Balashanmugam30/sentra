"use client";

import { formatMoney } from "@/lib/channel/runtime";
import type { ChannelRevenueState } from "@/lib/channel/types";

export function CommissionCenter({ revenue, busyAction, onPay }: { revenue: ChannelRevenueState; busyAction: string | null; onPay: (commissionId: string) => void }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">Commissions</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Partner payout center</h2>
        </div>
        <p className="font-mono text-2xl text-amber-200">{formatMoney(revenue.commission_due)}</p>
      </div>
      <div className="mt-5 space-y-3">
        {revenue.commissions.map((commission) => (
          <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-black/25 p-4 sm:flex-row sm:items-center sm:justify-between" key={commission.commission_id}>
            <div>
              <h3 className="font-semibold text-white">{commission.partner_id}</h3>
              <p className="text-sm text-white/45">{commission.status} · due {commission.due_at}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-lg text-white">{formatMoney(commission.amount)}</span>
              <button className="rounded-2xl border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-sm font-semibold text-emerald-100 disabled:opacity-50" disabled={commission.status === "paid" || busyAction === `commission-${commission.commission_id}`} onClick={() => onPay(commission.commission_id)} type="button">
                Pay
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

