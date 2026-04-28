"use client";

import { formatSecurityDate, statusTone } from "@/lib/securitycenter/runtime";
import type { SecurityAlert } from "@/lib/securitycenter/types";

export function AlertsFeed({ alerts }: { alerts: SecurityAlert[] }) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-100/70">Suspicious Attempts</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Security alert feed</h2>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/50">
          {alerts.length} live
        </span>
      </div>

      <div className="mt-5 grid gap-3">
        {alerts.map((alert) => (
          <article key={alert.alert_id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${statusTone(alert.status)}`}>
                {alert.severity} / {alert.status}
              </span>
              <time className="font-mono text-xs text-white/45">{formatSecurityDate(alert.created_at)}</time>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-white">{alert.title}</h3>
            <p className="mt-2 text-sm leading-6 text-white/55">{alert.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
