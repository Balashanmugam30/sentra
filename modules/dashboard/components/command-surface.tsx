"use client";

import type { Incident } from "@/lib/api/incident";

type CommandSurfaceProps = {
  incidents: Incident[];
};

export function CommandSurface({ incidents }: CommandSurfaceProps) {
  const latestIncidents = [...incidents].slice(0, 8);

  return (
    <div
      className="relative flex w-full max-w-6xl min-h-[500px] flex-shrink-0 items-stretch justify-start overflow-hidden rounded-[32px] border backdrop-blur-xl lg:min-h-[60vh]"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface)",
        boxShadow: "var(--sentra-shadow-panel)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-[1px] rounded-[31px]"
        style={{
          border: "1px solid var(--border)",
          background: "var(--surface-soft)",
        }}
      />

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-start overflow-hidden px-6 pb-6 pt-10 text-center">
        <div
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] border backdrop-blur-xl"
          style={{
            borderColor: "var(--sentra-border-subtle)",
            background: "var(--surface)",
          }}
        >
          <svg
            aria-hidden="true"
            className="h-9 w-9"
            fill="none"
            viewBox="0 0 24 24"
            style={{ color: "var(--text)" }}
          >
            <path
              d="M4 18.5V8.8m5 9.7V5.5m5 13V10m5 8.5V7.5M2 20h20"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.6"
            />
            <path
              d="m4 13 5-3.5 5 2.5L19 8"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.6"
            />
          </svg>
        </div>

        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.28em]" style={{ color: "var(--sentra-text-soft)" }}>
            Live Incident Map Panel
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[var(--text)] md:text-4xl">
            Live Command Surface
          </h1>
          <p className="text-sm md:text-base" style={{ color: "var(--sentra-text-muted)" }}>
            {incidents.length > 0 ? "Live incident feed connected." : "Awaiting Data Feed..."}
          </p>
        </div>

        <div
          className="mt-8 inline-flex items-center gap-3 rounded-full border px-4 py-2 backdrop-blur-xl"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface)",
          }}
        >
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--text)" }} />
          <span
            className="text-xs font-medium uppercase tracking-[0.18em]"
            style={{ color: "var(--sentra-text-muted)" }}
          >
            {incidents.length > 0 ? `${incidents.length} Active Incidents` : "No Active Incidents"}
          </span>
        </div>

        {latestIncidents.length > 0 ? (
          <div
            className="mt-6 max-h-[240px] w-full overflow-y-auto rounded-[20px] border px-4 py-3"
            style={{
              borderColor: "var(--sentra-border-subtle)",
              background: "var(--surface)",
            }}
          >
            <div className="flex flex-col text-sm" style={{ color: "var(--text)" }}>
              {latestIncidents.map((item, index) => (
                <div
                  className="flex items-center justify-between py-2"
                  key={`${item.id}-${item.status}-${index}`}
                  style={{
                    borderBottom:
                      index === latestIncidents.length - 1
                        ? "none"
                        : "1px solid var(--sentra-border-subtle)",
                  }}
                >
                  <span className="font-medium">{item.type}</span>
                  <span style={{ color: "var(--sentra-text-muted)" }}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
