import { statusClass } from "@/lib/revenue/helpers";
import type { PaymentHealth as PaymentHealthType } from "@/lib/revenue/types";

type PaymentHealthProps = {
  payment: PaymentHealthType;
};

export function PaymentHealth({ payment }: PaymentHealthProps) {
  const posture = payment.collections_risk === "low" ? "healthy" : payment.collections_risk;
  return (
    <article className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/70">Payment health</p>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-3xl font-black text-white">{payment.payment_method_valid ? "Valid" : "Failed"}</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">{payment.next_action}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${statusClass(posture)}`}>{posture}</span>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-black/20 p-3 text-center">
          <p className="text-xl font-black text-white">{payment.retry_attempts}</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">retries</p>
        </div>
        <div className="rounded-2xl bg-black/20 p-3 text-center">
          <p className="text-xl font-black text-white">{payment.failed_charges}</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">failed</p>
        </div>
        <div className="rounded-2xl bg-black/20 p-3 text-center">
          <p className="text-xl font-black text-white">{payment.grace_period_remaining}</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">grace days</p>
        </div>
      </div>
    </article>
  );
}

