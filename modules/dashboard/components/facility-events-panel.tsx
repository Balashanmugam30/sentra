"use client";

import { useFacility } from "@/lib/facility/use-facility";

export function FacilityEventsPanel() {
  const { events } = useFacility();

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
            Facility Event Ledger
          </p>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
            Timeline of infrastructure commands, alarms, CCTV metadata, and coordinated building actions
          </h2>
        </div>

        <div className="mt-6 space-y-4">
          {(events?.events ?? []).map((event, index) => (
            <div
              className="rounded-[22px] border p-4"
              key={`${event.timestamp}-${event.message}-${index}`}
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm font-medium text-[var(--text)]">{event.message}</div>
                  <div className="mt-2 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    {event.source.replaceAll("_", " ")}
                  </div>
                </div>
                <div className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                  {new Date(event.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

