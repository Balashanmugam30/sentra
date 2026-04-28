"use client";

import { memo, useEffect, useRef } from "react";

import { Badge, Card } from "@/components/ui";
import { useDemoStore } from "@/store/demo-store";

export const EventTrace = memo(function EventTrace() {
  const eventTrace = useDemoStore((state) => state.eventTrace);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = scrollContainerRef.current;
    if (!node) {
      return;
    }

    node.scrollTop = node.scrollHeight;
  }, [eventTrace.length]);

  if (eventTrace.length === 0) {
    return null;
  }

  return (
    <Card className="w-[min(28rem,calc(100vw-2rem))] border-[color-mix(in_srgb,var(--color-border)_86%,transparent)] bg-[color-mix(in_srgb,var(--color-surface)_94%,transparent)] p-4 backdrop-blur-md">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted">Event Trace</p>
            <p className="text-sm font-semibold text-foreground">Realtime execution log</p>
          </div>
          <Badge tone="primary">{eventTrace.length} events</Badge>
        </div>

        <div className="max-h-44 space-y-2 overflow-y-auto pr-1" ref={scrollContainerRef}>
          {eventTrace.map((entry) => (
            <div
              className="flex items-start justify-between gap-3 rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--color-border)_72%,transparent)] bg-[color-mix(in_srgb,var(--color-surface-strong)_72%,transparent)] px-3 py-2"
              key={entry.id}
            >
              <div className="min-w-0 space-y-1">
                <p className="text-xs font-medium text-foreground">{entry.label}</p>
                <p className="text-[0.75rem] text-muted">
                  [{new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}]
                  {entry.phase ? ` ${entry.phase}` : ""}
                  {entry.fault ? ` • ${entry.fault.replaceAll("_", " ")}` : ""}
                </p>
              </div>
              <Badge tone={entry.source === "simulation" ? "warning" : "success"}>
                {entry.source === "simulation" ? "Sim" : "Live"}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
});
