"use client";

import { useOverride } from "@/lib/perception/use-override";
import type { OverrideGlobalMode } from "@/lib/perception/types";

function formatTimestamp(timestamp: string | undefined) {
  if (!timestamp) {
    return "Waiting for adaptive review";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Waiting for adaptive review";
  }

  return date.toLocaleString();
}

function getModeStyles(mode: OverrideGlobalMode) {
  if (mode === "emergency-correction") {
    return {
      color: "#fca5a5",
      background: "rgba(127, 29, 29, 0.28)",
      border: "rgba(248, 113, 113, 0.28)",
    };
  }

  if (mode === "adaptive-control") {
    return {
      color: "#fcd34d",
      background: "rgba(120, 53, 15, 0.24)",
      border: "rgba(245, 158, 11, 0.24)",
    };
  }

  return {
    color: "#bbf7d0",
    background: "rgba(20, 83, 45, 0.22)",
    border: "rgba(74, 222, 128, 0.22)",
  };
}

export function OverridePanel() {
  const { data, loading, error } = useOverride();
  const modeStyles = getModeStyles(data?.global_mode ?? "aligned");

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
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p
              className="text-[0.7rem] uppercase tracking-[0.26em]"
              style={{ color: "var(--sentra-text-soft)" }}
            >
              Adaptive Decision Control
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              Autonomous Recommendation Override Engine
            </h2>
            <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
              Generated {formatTimestamp(data?.generated_at)}
            </p>
          </div>
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em]"
            style={{
              borderColor: modeStyles.border,
              background: modeStyles.background,
              color: modeStyles.color,
            }}
          >
            {loading ? "Reviewing" : data?.global_mode ?? "aligned"}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div
              className="rounded-[22px] border p-4"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Override Count", data?.override_count ?? 0],
                  ["Zones Reviewed", data?.zones_reviewed ?? 0],
                ].map(([label, value], index) => (
                  <div
                    className="rounded-[18px] border px-4 py-3"
                    key={`${label}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                    }}
                  >
                    <div
                      className="text-[0.7rem] uppercase tracking-[0.18em]"
                      style={{ color: "var(--sentra-text-soft)" }}
                    >
                      {label}
                    </div>
                    <div className="mt-2 text-lg font-medium text-[var(--text)]">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="rounded-[22px] border p-4"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <h3 className="text-sm font-medium text-[var(--text)]">Override Cards</h3>
              <div className="mt-3 space-y-3">
                {(data?.overrides ?? []).map((item, index) => (
                  <div
                    className="rounded-[18px] border px-4 py-3"
                    key={`${item.type}-${item.zone}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-[var(--text)]">{item.zone}</span>
                      <span
                        className="text-[0.65rem] uppercase tracking-[0.16em]"
                        style={{ color: "var(--sentra-text-soft)" }}
                      >
                        {item.type.replaceAll("_", " ")}
                      </span>
                    </div>
                    <div className="mt-2 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                      {item.old_value}
                    </div>
                    <div className="mt-1 text-sm font-medium text-[var(--text)]">
                      {item.new_value}
                    </div>
                    <div className="mt-2 text-xs" style={{ color: "var(--sentra-text-soft)" }}>
                      {item.reason}
                    </div>
                  </div>
                ))}
                {(data?.overrides?.length ?? 0) === 0 ? (
                  <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    {error ?? "All active decisions remain aligned with fusion truth."}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div
              className="rounded-[22px] border p-4"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <h3 className="text-sm font-medium text-[var(--text)]">Approved Decisions</h3>
              <div className="mt-3 space-y-3">
                {(data?.approved_decisions ?? []).map((item, index) => (
                  <div
                    className="rounded-[18px] border px-4 py-3 text-sm"
                    key={`${item}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                      color: "var(--text)",
                    }}
                  >
                    {item}
                  </div>
                ))}
                {(data?.approved_decisions?.length ?? 0) === 0 ? (
                  <p className="text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    No decisions approved yet for this cycle.
                  </p>
                ) : null}
              </div>
            </div>

            <div
              className="rounded-[22px] border p-4"
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <h3 className="text-sm font-medium text-[var(--text)]">Recommended Focus</h3>
              <div className="mt-3 space-y-3">
                {(data?.recommended_focus ?? []).map((item, index) => (
                  <div
                    className="rounded-[18px] border px-4 py-3 text-sm"
                    key={`${item}-${index}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                      color: "var(--text)",
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
