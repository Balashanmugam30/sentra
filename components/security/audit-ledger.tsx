"use client";

import { useEffect, useState } from "react";

import {
  getAuditEvents,
  maskIpAddress,
  SEEDED_AUDIT_LIVE,
  type AuditEvent,
} from "@/lib/security/audit";

const STATUS_STYLES: Record<string, string> = {
  success: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  denied: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  error: "border-rose-300/25 bg-rose-300/10 text-rose-100",
};

export function AuditLedger() {
  const [events, setEvents] = useState<AuditEvent[]>(SEEDED_AUDIT_LIVE.recent_events);
  const [totalRecords, setTotalRecords] = useState(SEEDED_AUDIT_LIVE.integrity_status.total_records);

  useEffect(() => {
    let cancelled = false;
    void getAuditEvents(1, 18).then((page) => {
      if (cancelled) {
        return;
      }
      setEvents(page.events);
      setTotalRecords(page.total_records);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="rounded-[32px] border border-white/10 bg-[rgba(3,8,18,0.78)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/70">
            Immutable Audit Ledger
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Hash-chained security events</h2>
        </div>
        <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
          {totalRecords} records sealed
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-3xl border border-white/10">
        <div className="grid grid-cols-[1.1fr_0.8fr_0.8fr_0.7fr] gap-3 border-b border-white/10 bg-white/[0.04] px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-white/45 md:grid-cols-[1fr_0.8fr_1fr_0.8fr_0.8fr_0.7fr]">
          <span>Time</span>
          <span>Actor</span>
          <span className="hidden md:block">Action</span>
          <span className="hidden md:block">IP / Device</span>
          <span>Result</span>
          <span>Risk</span>
        </div>
        <div className="divide-y divide-white/10">
          {events.map((event) => (
            <article
              className="grid grid-cols-[1.1fr_0.8fr_0.8fr_0.7fr] gap-3 px-4 py-3 text-sm text-white/70 md:grid-cols-[1fr_0.8fr_1fr_0.8fr_0.8fr_0.7fr]"
              key={event.event_id}
            >
              <span className="font-mono text-xs text-white/45">
                {new Date(event.timestamp_utc).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              <span className="min-w-0 truncate">{event.actor_email ?? "system"}</span>
              <span className="hidden min-w-0 truncate md:block">
                {event.category}.{event.action}
              </span>
              <span className="hidden font-mono text-xs text-white/45 md:block">
                {maskIpAddress(event.source_ip)}
              </span>
              <span
                className={[
                  "w-fit rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]",
                  STATUS_STYLES[event.status] ?? STATUS_STYLES.success,
                ].join(" ")}
              >
                {event.status}
              </span>
              <span className="font-semibold text-white">{event.risk_score}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
