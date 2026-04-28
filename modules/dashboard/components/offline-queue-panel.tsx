"use client";

import { useOffline } from "@/lib/offline/use-offline";

function formatPayload(payload: Record<string, unknown>) {
  const entries = Object.entries(payload).slice(0, 3);
  return entries.map(([key, value]) => `${key} ${String(value)}`).join(" | ");
}

export function OfflineQueuePanel() {
  const { cache } = useOffline();

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
            Offline Event Queue Ledger
          </p>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
            Queued local mutations, telemetry, acknowledgements, and recovery sync state
          </h2>
        </div>

        <div className="mt-6 space-y-4">
          {(cache?.queued_events ?? []).map((event, index) => (
            <div
              className="rounded-[22px] border p-4"
              key={`${event.event_id}-${index}`}
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className="rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em]"
                      style={{
                        borderColor: "var(--sentra-border-subtle)",
                        background: "rgba(255,255,255,0.04)",
                        color: "var(--sentra-text-muted)",
                      }}
                    >
                      {event.source}
                    </span>
                    <span
                      className="rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em]"
                      style={{
                        borderColor:
                          event.sync_state === "synced"
                            ? "rgba(74, 222, 128, 0.22)"
                            : event.sync_state === "failed"
                              ? "rgba(248, 113, 113, 0.28)"
                              : "rgba(251, 191, 36, 0.24)",
                        background:
                          event.sync_state === "synced"
                            ? "rgba(20, 83, 45, 0.2)"
                            : event.sync_state === "failed"
                              ? "rgba(127, 29, 29, 0.2)"
                              : "rgba(146, 64, 14, 0.16)",
                        color:
                          event.sync_state === "synced"
                            ? "#bbf7d0"
                            : event.sync_state === "failed"
                              ? "#fecaca"
                              : "#fde68a",
                      }}
                    >
                      {event.sync_state}
                    </span>
                  </div>
                  <div className="text-lg font-medium text-[var(--text)]">
                    {event.type.replaceAll("_", " ")}
                  </div>
                  <div className="text-sm text-[var(--text)]">{formatPayload(event.payload)}</div>
                </div>

                <div className="w-full max-w-[280px] space-y-3">
                  <div
                    className="rounded-[18px] border px-4 py-3"
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                    }}
                  >
                    <div
                      className="text-[0.64rem] uppercase tracking-[0.16em]"
                      style={{ color: "var(--sentra-text-soft)" }}
                    >
                      Event
                    </div>
                    <div className="mt-2 text-sm text-[var(--text)]">{event.event_id}</div>
                  </div>
                  <div
                    className="rounded-[18px] border px-4 py-3"
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                    }}
                  >
                    <div
                      className="text-[0.64rem] uppercase tracking-[0.16em]"
                      style={{ color: "var(--sentra-text-soft)" }}
                    >
                      Created
                    </div>
                    <div className="mt-2 text-sm text-[var(--text)]">
                      {new Date(event.created_at).toLocaleString()}
                    </div>
                  </div>
                  {event.last_error ? (
                    <div
                      className="rounded-[18px] border px-4 py-3 text-sm"
                      style={{
                        borderColor: "rgba(248, 113, 113, 0.24)",
                        background: "rgba(127, 29, 29, 0.16)",
                        color: "#fecaca",
                      }}
                    >
                      {event.last_error}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}

          {(cache?.queued_events ?? []).length === 0 ? (
            <div
              className="rounded-[22px] border px-4 py-6 text-sm"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
                color: "var(--sentra-text-muted)",
              }}
            >
              Offline queue empty. Local-first ledger will populate when outages or queued mutations occur.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

