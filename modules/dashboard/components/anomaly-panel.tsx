"use client";

import { useAudit } from "@/lib/audit/use-audit";

function anomalyTone(severity: string) {
  if (severity === "critical") {
    return {
      color: "#fecaca",
      borderColor: "rgba(248, 113, 113, 0.28)",
      background: "rgba(127, 29, 29, 0.2)",
    };
  }
  if (severity === "high") {
    return {
      color: "#fde68a",
      borderColor: "rgba(245, 158, 11, 0.24)",
      background: "rgba(120, 53, 15, 0.18)",
    };
  }
  if (severity === "medium") {
    return {
      color: "#dbeafe",
      borderColor: "rgba(96, 165, 250, 0.24)",
      background: "rgba(30, 64, 175, 0.16)",
    };
  }
  return {
    color: "#bbf7d0",
    borderColor: "rgba(74, 222, 128, 0.22)",
    background: "rgba(20, 83, 45, 0.2)",
  };
}

export function AnomalyPanel() {
  const { live } = useAudit();

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
            Security Anomaly Radar
          </p>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
            Brute force, unusual activity, command spikes, and chain-risk signals
          </h2>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(live?.anomalies ?? []).map((anomaly, index) => {
            const tone = anomalyTone(anomaly.severity);
            return (
              <div
                className="rounded-[22px] border p-4"
                key={`${anomaly.anomaly_id}-${anomaly.related_event_ids.join("-")}-${index}`}
                style={{
                  borderColor: tone.borderColor,
                  background: tone.background,
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium" style={{ color: tone.color }}>
                    {anomaly.title}
                  </div>
                  <div className="text-[0.65rem] uppercase tracking-[0.14em]" style={{ color: tone.color }}>
                    {anomaly.severity}
                  </div>
                </div>
                <p className="mt-3 text-sm" style={{ color: "var(--text)" }}>
                  {anomaly.description}
                </p>
              </div>
            );
          })}
          {!(live?.anomalies?.length ?? 0) ? (
            <div
              className="rounded-[22px] border p-4 text-sm"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
                color: "var(--sentra-text-muted)",
              }}
            >
              No active anomalies detected in the audit stream.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
