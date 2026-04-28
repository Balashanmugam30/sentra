"use client";

import { marketplaceTone, marketplaceStatusTone } from "@/lib/marketplace/runtime";
import type { MarketplaceSecurityState } from "@/lib/marketplace/types";

export function SecurityBadges({ security, busyAction, onApprove }: { security: MarketplaceSecurityState; busyAction: string | null; onApprove: (appId: string) => void }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">Security Review</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">Trust and permission approvals</h3>
      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        {security.approvals.map((approval) => (
          <article className="rounded-2xl border border-white/10 bg-black/20 p-4" key={approval.approval_id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-sm text-white">{approval.app_id}</p>
                <p className="mt-1 text-xs text-white/45">{approval.data_access_class}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs ${marketplaceStatusTone(approval.status)}`}>{approval.status}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <span className={`rounded-2xl border p-3 text-center font-mono text-lg ${marketplaceTone(approval.trust_score)}`}>{approval.trust_score}</span>
              <span className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3 text-center font-mono text-lg text-amber-100">{approval.permission_risk}</span>
            </div>
            <button className="mt-4 w-full rounded-xl border border-cyan-200/20 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/10 disabled:opacity-50" disabled={busyAction !== null || approval.status === "approved"} onClick={() => onApprove(approval.app_id)} type="button">
              Approve
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

