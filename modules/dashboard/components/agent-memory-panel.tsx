"use client";

import { useAgents } from "@/lib/agents/use-agents";

export function AgentMemoryPanel() {
  const { memory } = useAgents();

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
            Specialist Agent Memory Grid
          </p>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
            Recent lessons, preferred actions, and trusted patterns across the command council
          </h2>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(memory?.agents ?? []).map((agent, index) => (
            <div
              className="rounded-[22px] border p-4"
              key={`${agent.agent_id}-${index}`}
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <div className="text-sm font-medium text-[var(--text)]">{agent.name}</div>
              <div
                className="mt-1 text-[0.68rem] uppercase tracking-[0.16em]"
                style={{ color: "var(--sentra-text-soft)" }}
              >
                {agent.domain.replaceAll("_", " ")}
              </div>

              <div className="mt-4 space-y-3">
                {[
                  ["Recent Lessons", agent.recent_alerts],
                  ["Preferred Actions", agent.preferred_actions],
                  ["Pattern Notes", agent.trusted_patterns],
                ].map(([label, items], sectionIndex) => (
                  <div
                    className="rounded-[18px] border px-4 py-3"
                    key={`${agent.agent_id}-${label}-${sectionIndex}`}
                    style={{
                      borderColor: "var(--sentra-border-subtle)",
                      background: "var(--surface)",
                    }}
                  >
                    <div
                      className="text-[0.64rem] uppercase tracking-[0.16em]"
                      style={{ color: "var(--sentra-text-soft)" }}
                    >
                      {label}
                    </div>
                    <div className="mt-2 space-y-2">
                      {(items as string[]).slice(0, 3).map((item, itemIndex) => (
                        <div
                          className="text-sm"
                          key={`${agent.agent_id}-${label}-${itemIndex}`}
                          style={{ color: "var(--text)" }}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
