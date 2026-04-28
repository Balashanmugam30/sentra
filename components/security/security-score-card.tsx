"use client";

import { useEffect, useState } from "react";

import { getAuditLive, SEEDED_AUDIT_LIVE, type AuditLive } from "@/lib/security/audit";
import { buildSecurityTrustSnapshot, type SecurityTrustSnapshot } from "@/lib/security/hardening";
import { loadPrivacySettings } from "@/lib/security/privacy";

const BAR_KEYS: Array<keyof Omit<SecurityTrustSnapshot, "score" | "label">> = [
  "authPosture",
  "rbacCoverage",
  "rateLimiting",
  "auditIntegrity",
  "sessionHygiene",
  "privacyReadiness",
];

const LABELS: Record<(typeof BAR_KEYS)[number], string> = {
  authPosture: "Auth posture",
  rbacCoverage: "RBAC coverage",
  rateLimiting: "Rate limiting",
  auditIntegrity: "Audit integrity",
  sessionHygiene: "Session hygiene",
  privacyReadiness: "Privacy readiness",
};

export function SecurityScoreCard() {
  const [audit, setAudit] = useState<AuditLive>(SEEDED_AUDIT_LIVE);
  const [snapshot, setSnapshot] = useState(() => buildSecurityTrustSnapshot(SEEDED_AUDIT_LIVE));

  useEffect(() => {
    let cancelled = false;
    void getAuditLive().then((nextAudit) => {
      if (cancelled) {
        return;
      }
      const privacy = loadPrivacySettings();
      setAudit(nextAudit);
      setSnapshot(buildSecurityTrustSnapshot(nextAudit, privacy));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="rounded-[32px] border border-cyan-300/15 bg-[rgba(3,8,18,0.82)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/70">
            Enterprise Trust Score
          </p>
          <div className="mt-4 flex items-end gap-3">
            <span className="text-6xl font-semibold tracking-[-0.08em] text-white">{snapshot.score}</span>
            <span className="pb-2 text-lg font-semibold text-cyan-100">%</span>
          </div>
          <p className="mt-3 text-sm uppercase tracking-[0.18em] text-emerald-200/80">
            {snapshot.label} posture
          </p>
          <p className="mt-3 max-w-lg text-sm leading-6 text-white/55">
            Score blends auth posture, RBAC coverage, rate limits, hash-chain audit integrity,
            session hygiene, privacy settings, and retention governance.
          </p>
        </div>

        <div className="grid flex-1 gap-3 md:grid-cols-2">
          {BAR_KEYS.map((key) => (
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3" key={key}>
              <div className="flex items-center justify-between text-xs">
                <span className="uppercase tracking-[0.16em] text-white/45">{LABELS[key]}</span>
                <span className="font-semibold text-white">{snapshot[key]}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-200"
                  style={{ width: `${snapshot[key]}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {[
          ["Events today", audit.totals.total_events_today],
          ["Failed logins", audit.totals.failed_logins],
          ["Denied requests", audit.totals.denied_requests],
          ["Ledger records", audit.integrity_status.total_records],
        ].map(([label, value]) => (
          <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3" key={label}>
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">{label}</p>
            <p className="mt-2 text-xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
