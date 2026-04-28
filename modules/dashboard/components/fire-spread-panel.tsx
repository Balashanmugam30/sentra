"use client";

import { useFireSpread } from "@/lib/predictions/use-fire-spread";

function formatTimestamp(timestamp: string | undefined) {
  if (!timestamp) {
    return "Waiting for spread forecast";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Waiting for spread forecast";
  }

  return date.toLocaleString();
}

function getStatusStyles(status: "watch" | "danger" | "critical") {
  if (status === "critical") {
    return {
      label: "#fca5a5",
      bar: "rgba(248, 113, 113, 0.82)",
      chipBackground: "rgba(127, 29, 29, 0.28)",
      chipBorder: "rgba(248, 113, 113, 0.28)",
    };
  }

  if (status === "danger") {
    return {
      label: "#fcd34d",
      bar: "rgba(245, 158, 11, 0.82)",
      chipBackground: "rgba(120, 53, 15, 0.24)",
      chipBorder: "rgba(245, 158, 11, 0.24)",
    };
  }

  return {
    label: "var(--sentra-text-muted)",
    bar: "rgba(148, 163, 184, 0.55)",
    chipBackground: "var(--surface)",
    chipBorder: "var(--sentra-border-subtle)",
  };
}

export function FireSpreadPanel() {
  const { data, loading, error } = useFireSpread();
  const forecasts = data?.forecasts?.slice(0, 5) ?? [];

  return (
    <section
      className="relative w-full max-w-6xl overflow-hidden rounded-[28px] border px-6 py-5 backdrop-blur-xl"
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
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p
              className="text-[0.7rem] uppercase tracking-[0.26em]"
              style={{ color: "var(--sentra-text-soft)" }}
            >
              Fire Spread Forecast
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              Next Impact Zones
            </h2>
            <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
              Generated {formatTimestamp(data?.generated_at)}
            </p>
          </div>
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em]"
            style={{
              borderColor: "var(--sentra-border-subtle)",
              background: "var(--surface)",
              color: "var(--sentra-text-muted)",
            }}
          >
            {loading ? "Refreshing" : `${data?.active_sources ?? 0} Active Sources`}
          </div>
        </div>

        <div
          className="mt-6 rounded-[22px] border p-4"
          style={{
            borderColor: "var(--sentra-border-subtle)",
            background: "var(--surface-soft)",
          }}
        >
          {error ? (
            <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
              {error}
            </p>
          ) : forecasts.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
              No active fire spread forecasts yet.
            </p>
          ) : (
            <div className="space-y-3">
              {forecasts.map((forecast, index) => {
                const styles = getStatusStyles(forecast.status);
                const percentage = Math.round(forecast.probability * 100);

                return (
                  <div
                    className="rounded-[18px] border px-4 py-3"
                    key={`${forecast.source_zone}-${forecast.target_zone}-${forecast.status}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                    }}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-[var(--text)]">
                          {forecast.source_zone} → {forecast.target_zone}
                        </div>
                        <div
                          className="text-xs uppercase tracking-[0.18em]"
                          style={{ color: "var(--sentra-text-soft)" }}
                        >
                          ETA {forecast.eta_minutes}m
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div
                          className="rounded-full border px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.18em]"
                          style={{
                            borderColor: styles.chipBorder,
                            background: styles.chipBackground,
                            color: styles.label,
                          }}
                        >
                          {forecast.status}
                        </div>
                        <div className="text-sm font-medium text-[var(--text)]">
                          {percentage}%
                        </div>
                      </div>
                    </div>

                    <div
                      className="mt-3 h-2 overflow-hidden rounded-full"
                      style={{ background: "var(--surface-soft)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-300 ease-in-out"
                        style={{
                          width: `${percentage}%`,
                          background: styles.bar,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
