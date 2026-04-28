"use client";

import { useDebate } from "@/lib/agents/use-debate";

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

export function DebateHistoryPanel() {
  const { history } = useDebate();

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
            Decision Debate Archive
          </p>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
            Timeline of prior debate sessions, negotiation outcomes, and winning strategies
          </h2>
        </div>

        <div className="mt-6 space-y-4">
          {(history?.sessions ?? []).map((session, index) => (
            <div
              className="rounded-[22px] border p-4"
              key={`${session.debate_id}-${index}`}
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-lg font-medium text-[var(--text)]">
                    {formatTimestamp(session.started_at)} {session.scenario.replaceAll("_", " ")}
                  </div>
                  <div className="mt-2 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    {session.outcome_summary}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-[var(--text)]">
                    {session.consensus_score}%
                  </div>
                  <div
                    className="mt-1 text-[0.68rem] uppercase tracking-[0.16em]"
                    style={{ color: "var(--sentra-text-soft)" }}
                  >
                    {session.status}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
