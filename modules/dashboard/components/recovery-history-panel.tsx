"use client";

import { useResilience } from "@/lib/resilience/use-resilience";

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

export function RecoveryHistoryPanel() {
  const { history } = useResilience();

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
            Recovery Event Ledger
          </p>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
            Timeline of retries, fallbacks, approval escalations, and recovery actions
          </h2>
        </div>

        <div className="mt-6 space-y-4">
          {(history?.events ?? []).map((event, index) => (
            <div
              className="rounded-[22px] border p-4"
              key={`${event.timestamp}-${index}`}
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="text-lg font-medium text-[var(--text)]">
                  {formatTimestamp(event.timestamp)} {event.message}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
