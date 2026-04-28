"use client";

import { useAudit } from "@/lib/audit/use-audit";

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function actionLabel(action: string) {
  return action.replaceAll("_", " ");
}

export function AuditLedgerPanel() {
  const { events, live } = useAudit();
  const rows = events?.events ?? live?.recent_events ?? [];

  return (
    <section
      className="relative w-full overflow-hidden rounded-[28px] border px-6 py-5 backdrop-blur-xl"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface)",
        boxShadow: "var(--sentra-shadow-panel)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-[1px] rounded-[27px]"
        style={{
          border: "1px solid var(--border)",
          background: "var(--surface-soft)",
        }}
      />

      <div className="relative z-10">
        <div className="space-y-2">
          <p
            className="text-[0.7rem] uppercase tracking-[0.26em]"
            style={{ color: "var(--sentra-text-soft)" }}
          >
            Forensic Audit Ledger
          </p>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
            Immutable timeline of authentication, role changes, command actions, and denied requests
          </h2>
        </div>

        <div className="mt-6 space-y-4">
          {rows.map((event, index) => (
            <div
              className="rounded-[22px] border p-4"
              key={`${event.event_id}-${event.timestamp_utc}-${event.record_hash}-${index}`}
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-lg font-medium text-[var(--text)]">
                    {formatTimestamp(event.timestamp_utc)} {event.actor_email ?? "system"} {actionLabel(event.action)}
                  </div>
                  <div className="mt-2 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    {event.target_module || "system"}
                    {event.target_id ? ` | ${event.target_id}` : ""}
                    {event.reason ? ` | ${event.reason}` : ""}
                  </div>
                </div>
                <div
                  className="rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em]"
                  style={{
                    borderColor: "rgba(148, 163, 184, 0.18)",
                    background: "rgba(255,255,255,0.04)",
                    color: "var(--sentra-text-muted)",
                  }}
                >
                  {event.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
