"use client";

import { trustTone } from "@/lib/securitydefense/runtime";
import type { ZeroTrustIdentity } from "@/lib/securitydefense/types";

export function SessionRiskGrid({ identities, onRevokeSession, busyAction }: { identities: ZeroTrustIdentity[]; onRevokeSession: () => void; busyAction: string | null }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-100/70">Session Risk</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Identity trust decisions</h2>
        </div>
        <button className="rounded-2xl border border-red-200/20 px-4 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-400/10 disabled:opacity-50" disabled={busyAction !== null} onClick={onRevokeSession} type="button">
          Revoke Risky Session
        </button>
      </div>
      <div className="mt-5 grid gap-3">
        {identities.map((identity) => (
          <article className="rounded-3xl border border-white/10 bg-black/20 p-4" key={identity.identity_id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{identity.actor}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/40">{identity.role} / {identity.decision}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 font-mono text-xs ${trustTone(identity.trust_score)}`}>Trust {identity.trust_score}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {identity.triggers.map((trigger) => (
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/55" key={trigger}>{trigger}</span>
              ))}
            </div>
            <p className="mt-3 text-sm leading-6 text-white/55">{identity.recommended_action}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
