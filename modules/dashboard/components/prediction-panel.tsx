"use client";

import { usePredictions } from "@/lib/predictions/use-predictions";

function formatTimestamp(timestamp: string | undefined) {
  if (!timestamp) {
    return "Waiting for forecast";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Waiting for forecast";
  }

  return date.toLocaleString();
}

export function PredictionPanel() {
  const { data, loading, error } = usePredictions();
  const predictions = data?.predictions?.slice(0, 5) ?? [];

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
              Prediction Engine
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              Live Risk Forecast
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
            {loading ? "Refreshing" : `${predictions.length} Zones`}
          </div>
        </div>

        <div className="mt-6 rounded-[22px] border p-4" style={{ borderColor: "var(--sentra-border-subtle)", background: "var(--surface-soft)" }}>
          {error ? (
            <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
              {error}
            </p>
          ) : predictions.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
              No active predictions yet.
            </p>
          ) : (
            <div className="space-y-3">
              {predictions.map((prediction, index) => (
                <div
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-[18px] border px-4 py-3 text-sm"
                  key={`${prediction.zone}-${prediction.trend}-${prediction.eta_seconds}-${index}`}
                  style={{
                    borderColor: "var(--sentra-border-subtle)",
                    background: "var(--surface)",
                    color: "var(--text)",
                  }}
                >
                  <span className="font-medium">{prediction.zone}</span>
                  <span style={{ color: "var(--sentra-text-muted)" }}>
                    {Math.round(prediction.risk_score)}
                  </span>
                  <span className="uppercase" style={{ color: "var(--sentra-text-soft)" }}>
                    {prediction.trend}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
