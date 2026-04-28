import { formatCurrency, statusClass } from "@/lib/revenue/helpers";
import type { RevenueInvoice } from "@/lib/revenue/types";

type InvoiceLedgerProps = {
  invoices: RevenueInvoice[];
  busyAction: string | null;
  onMarkPaid: (invoiceId: string) => void;
};

export function InvoiceLedger({ invoices, busyAction, onMarkPaid }: InvoiceLedgerProps) {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-slate-950/30 backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Invoice ledger</p>
          <h2 className="mt-2 text-2xl font-black text-white">Collections + invoices</h2>
        </div>
        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-300">{invoices.length} records</span>
      </div>
      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
        <div className="hidden grid-cols-[1.1fr_0.8fr_0.7fr_0.7fr_0.8fr] gap-3 bg-white/[0.06] px-4 py-3 text-xs uppercase tracking-[0.18em] text-slate-500 md:grid">
          <span>Customer</span>
          <span>Period</span>
          <span>Total</span>
          <span>Status</span>
          <span>Action</span>
        </div>
        {invoices.map((invoice) => (
          <div key={invoice.invoice_id} className="grid gap-3 border-t border-white/10 px-4 py-4 text-sm md:grid-cols-[1.1fr_0.8fr_0.7fr_0.7fr_0.8fr]">
            <div>
              <p className="font-semibold text-white">{invoice.customer}</p>
              <p className="text-xs text-slate-500">{invoice.invoice_id}</p>
            </div>
            <p className="text-slate-300">{invoice.billing_period}</p>
            <p className="font-black text-white">{formatCurrency(invoice.total)}</p>
            <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold uppercase ${statusClass(invoice.status)}`}>{invoice.status}</span>
            <button
              type="button"
              onClick={() => onMarkPaid(invoice.invoice_id)}
              disabled={invoice.status === "paid" || busyAction === invoice.invoice_id}
              className="w-fit rounded-xl border border-cyan-300/25 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/20 disabled:opacity-40"
            >
              {invoice.status === "paid" ? "Settled" : "Mark paid"}
            </button>
          </div>
        ))}
      </div>
    </article>
  );
}

