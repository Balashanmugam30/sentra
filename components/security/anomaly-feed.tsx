"use client";

import { useEffect, useState } from "react";

import { buildAnomalyFeed, type SecurityAnomaly } from "@/lib/security/anomaly";
import { getAuditLive, SEEDED_AUDIT_LIVE } from "@/lib/security/audit";

const SEVERITY_STYLES: Record<string, string> = {
  low: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
  medium: "border-amber-300/20 bg-amber-300/10 text-amber-100",
  high: "border-orange-300/20 bg-orange-300/10 text-orange-100",
  critical: "border-rose-300/20 bg-rose-300/10 text-rose-100",
};

export function AnomalyFeed() {
  const [feed, setFeed] = useState<SecurityAnomaly[]>(() =>
    buildAnomalyFeed(SEEDED_AUDIT_LIVE.recent_events, SEEDED_AUDIT_LIVE.anomalies),
  );

  useEffect(() => {
    let cancelled = false;
    void getAuditLive().then((audit) => {
      if (!cancelled) {
        setFeed(buildAnomalyFeed(audit.recent_events, audit.anomalies));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="rounded-[32px] border border-white/10 bg-[rgba(3,8,18,0.78)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/70">
        Security Anomaly Feed
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Threat patterns under review</h2>

      <div className="mt-5 grid gap-3">
        {feed.map((item) => (
          <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-4" key={item.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-white/50">{item.description}</p>
              </div>
              <span
                className={[
                  "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
                  SEVERITY_STYLES[item.severity],
                ].join(" ")}
              >
                {item.severity}
              </span>
            </div>
            <p className="mt-3 font-mono text-xs text-cyan-100/65">{item.signal}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
