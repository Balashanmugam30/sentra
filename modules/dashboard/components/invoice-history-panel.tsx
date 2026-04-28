"use client";

import { useBilling } from "@/lib/billing/use-billing";

const money = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});

export function InvoiceHistoryPanel() {
  const { invoices } = useBilling();

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.76)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">
        Invoice History
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
        Tenant-scoped invoices and payment outcomes
      </h2>
      <div className="mt-5 grid gap-3">
        {(invoices?.invoices ?? []).slice(0, 6).map((invoice, index) => (
          <div
            className="grid gap-3 rounded-[22px] border border-white/10 bg-white/[0.045] p-4 md:grid-cols-[1fr_auto_auto]"
            key={`${invoice.invoice_id}-${invoice.created_at}-${index}`}
          >
            <div>
              <p className="text-sm font-semibold text-white">{invoice.number}</p>
              <p className="mt-1 text-xs text-white/44">{new Date(invoice.created_at).toLocaleString()}</p>
            </div>
            <span className="text-sm font-semibold text-white">{money.format(invoice.amount_due)}</span>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                invoice.status === "paid"
                  ? "border-cyan-200/18 bg-cyan-200/8 text-cyan-50"
                  : "border-red-200/18 bg-red-300/8 text-red-50"
              }`}
            >
              {invoice.status}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
