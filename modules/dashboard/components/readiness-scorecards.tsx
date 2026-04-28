"use client";

import type {
  AnalyticsCardStatus,
  ReadinessScorecardItem,
} from "@/lib/analytics/types";

function getStatusStyles(status: AnalyticsCardStatus) {
  if (status === "excellent") {
    return {
      bar: "linear-gradient(90deg, rgba(34,197,94,0.95), rgba(74,222,128,0.65))",
      color: "#bbf7d0",
    };
  }

  if (status === "good") {
    return {
      bar: "linear-gradient(90deg, rgba(59,130,246,0.95), rgba(96,165,250,0.65))",
      color: "#bfdbfe",
    };
  }

  if (status === "watch") {
    return {
      bar: "linear-gradient(90deg, rgba(245,158,11,0.95), rgba(251,191,36,0.65))",
      color: "#fde68a",
    };
  }

  return {
    bar: "linear-gradient(90deg, rgba(239,68,68,0.95), rgba(248,113,113,0.65))",
    color: "#fca5a5",
  };
}

export function ReadinessScorecards({
  scorecards,
  overallReadiness,
}: {
  scorecards: ReadinessScorecardItem[];
  overallReadiness: number;
}) {
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
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p
              className="text-[0.7rem] uppercase tracking-[0.26em]"
              style={{ color: "var(--sentra-text-soft)" }}
            >
              Readiness Scorecards
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
              Enterprise Capability Status
            </h2>
          </div>
          <div
            className="rounded-full border px-4 py-2 text-sm"
            style={{
              borderColor: "var(--sentra-border-subtle)",
              background: "rgba(255,255,255,0.04)",
              color: "var(--sentra-text-muted)",
            }}
          >
            Overall Readiness {overallReadiness}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {scorecards.map((card, index) => {
            const styles = getStatusStyles(card.status);
            return (
              <div
                className="rounded-[22px] border p-4"
                key={`${card.label}-${card.status}-${index}`}
                style={{
                  borderColor: "var(--sentra-border-subtle)",
                  background: "var(--surface-soft)",
                }}
              >
                <div className="text-sm font-medium text-[var(--text)]">{card.label}</div>
                <div className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[var(--text)]">
                  {card.score}
                </div>
                <div
                  className="mt-2 text-[0.7rem] uppercase tracking-[0.16em]"
                  style={{ color: styles.color }}
                >
                  {card.status}
                </div>
                <div
                  className="mt-4 h-2.5 overflow-hidden rounded-full"
                  style={{ background: "rgba(148, 163, 184, 0.12)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${card.score}%`,
                      background: styles.bar,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
