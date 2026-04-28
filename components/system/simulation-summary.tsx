"use client";

import { memo } from "react";

import { Badge, Card } from "@/components/ui";
import { timelineEngine } from "@/modules/simulation/timeline-engine";
import { useDemoStore } from "@/store/demo-store";

function SummaryAction({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-medium text-foreground transition hover:bg-[var(--color-surface-strong)] focus:outline-none focus:ring-2 focus:ring-brand"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

export const SimulationSummary = memo(function SimulationSummary() {
  const lastSummary = useDemoStore((state) => state.lastSummary);
  const clearSummary = useDemoStore((state) => state.clearSummary);

  if (!lastSummary) {
    return null;
  }

  return (
    <Card className="w-[min(26rem,calc(100vw-2rem))] border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] bg-[color-mix(in_srgb,var(--color-surface)_97%,transparent)] p-5 backdrop-blur-md">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted">Simulation Summary</p>
            <h2 className="text-base font-semibold text-foreground">{lastSummary.scenarioName}</h2>
            <p className="text-sm text-muted">Run completed at {new Date(lastSummary.completedAt).toLocaleTimeString()}</p>
          </div>
          <Badge tone={lastSummary.outcome === "success" ? "success" : "danger"}>{lastSummary.outcome}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface-strong)_74%,transparent)] p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Evacuation Time</p>
            <p className="mt-2 font-semibold text-foreground">{lastSummary.totalEvacuationTimeSec.toFixed(1)}s</p>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface-strong)_74%,transparent)] p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Alerts Triggered</p>
            <p className="mt-2 font-semibold text-foreground">{lastSummary.alertsTriggered}</p>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface-strong)_74%,transparent)] p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Response Latency</p>
            <p className="mt-2 font-semibold text-foreground">
              {lastSummary.systemResponseLatencyMs !== null ? `${lastSummary.systemResponseLatencyMs} ms` : "n/a"}
            </p>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface-strong)_74%,transparent)] p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Actors Active</p>
            <p className="mt-2 font-semibold text-foreground">{lastSummary.actorCount}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <SummaryAction onClick={() => timelineEngine.replayLastScenario()}>Replay scenario</SummaryAction>
          <SummaryAction
            onClick={() => {
              timelineEngine.stopScenario({ preserveReplay: true, suppressTelemetry: true });
              clearSummary();
            }}
          >
            Return to monitoring
          </SummaryAction>
        </div>
      </div>
    </Card>
  );
});
