"use client";

import type { PlatformLogsState } from "@/lib/platform/types";

export function LogStream({ logs }: { logs: PlatformLogsState }) {
  const rows = [
    ...logs.usage_logs.map((log) => ({
      id: log.log_id,
      label: `${log.method} ${log.endpoint}`,
      meta: `${log.requests.toLocaleString()} requests / ${log.latency_ms}ms`,
      type: "usage",
    })),
    ...logs.audit_events.map((event) => ({
      id: event.event_id,
      label: event.action,
      meta: `${event.tenant_id} / ${event.chain_hash}`,
      type: "audit",
    })),
  ].slice(0, 8);

  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">Audit Log Stream</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">Usage and platform actions</h3>
      <div className="mt-5 space-y-3">
        {rows.map((row) => (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4" key={`${row.type}-${row.id}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-sm text-white">{row.label}</p>
              <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white/45">{row.type}</span>
            </div>
            <p className="mt-2 text-xs text-white/45">{row.meta}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

