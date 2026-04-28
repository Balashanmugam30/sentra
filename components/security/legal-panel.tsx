"use client";

import type { LegalItem } from "@/lib/securitytrust/types";

export function LegalPanel({ items }: { items: LegalItem[] }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Legal Trust Room</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Procurement blockers and legal artifacts</h2>
      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <article className="rounded-2xl border border-white/10 bg-black/20 p-4" key={item.item_id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/40">{item.owner}</p>
              </div>
              <span className={item.buyer_blocker ? "text-sm text-amber-100" : "text-sm text-emerald-100"}>
                {item.buyer_blocker ? "buyer blocker" : item.status}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
