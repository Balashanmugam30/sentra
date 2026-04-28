"use client";

import type { AnalyticsCardStatus, AnalyticsKpiCard } from "@/lib/analytics/types";

function getStatusStyles(status: AnalyticsCardStatus) {
  if (status === "excellent") {
    return {
      borderColor: "rgba(74, 222, 128, 0.24)",
      background: "rgba(20, 83, 45, 0.2)",
      color: "#bbf7d0",
    };
  }

  if (status === "good") {
    return {
      borderColor: "rgba(96, 165, 250, 0.24)",
      background: "rgba(30, 64, 175, 0.16)",
      color: "#bfdbfe",
    };
  }

  if (status === "watch") {
    return {
      borderColor: "rgba(245, 158, 11, 0.24)",
      background: "rgba(120, 53, 15, 0.18)",
      color: "#fcd34d",
    };
  }

  return {
    borderColor: "rgba(248, 113, 113, 0.24)",
    background: "rgba(127, 29, 29, 0.18)",
    color: "#fca5a5",
  };
}

export function KpiStrip({ cards }: { cards: AnalyticsKpiCard[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const styles = getStatusStyles(card.status);

        return (
          <div
            className="rounded-[20px] border px-4 py-4"
            key={`${card.key}-${card.label}-${index}`}
            style={{
              borderColor: styles.borderColor,
              background: styles.background,
            }}
          >
            <div
              className="text-[0.68rem] uppercase tracking-[0.18em]"
              style={{ color: "var(--sentra-text-soft)" }}
            >
              {card.label}
            </div>
            <div className="mt-3 text-2xl font-semibold tracking-[-0.03em]" style={{ color: "var(--text)" }}>
              {card.value}
            </div>
            <div
              className="mt-2 text-[0.72rem] uppercase tracking-[0.16em]"
              style={{ color: styles.color }}
            >
              {card.status}
            </div>
          </div>
        );
      })}
    </div>
  );
}
