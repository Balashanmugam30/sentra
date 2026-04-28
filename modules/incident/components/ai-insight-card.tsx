"use client";

import { memo } from "react";

import { Badge, Card } from "@/components/ui";
import { useActiveIncident } from "@/hooks/use-active-incident";
import { getEvacuationEta, getTimeToImpact } from "@/modules/simulation/time-engine";
import { useDemoStore } from "@/store/demo-store";

function clampTextStyle(lines: number) {
  return {
    display: "-webkit-box",
    WebkitLineClamp: lines,
    WebkitBoxOrient: "vertical" as const,
    overflow: "hidden",
  };
}

export const AIInsightCard = memo(function AIInsightCard() {
  const activeIncident = useActiveIncident();
  const activeScenario = useDemoStore((state) => state.activeScenario);
  const timelinePosition = useDemoStore((state) => state.timelinePosition);

  const confidence = activeIncident?.aiInsight.confidence;
  const nextImpact =
    getTimeToImpact(activeScenario, timelinePosition) ??
    (activeIncident?.aiInsight.nextImpactLabel && activeIncident.aiInsight.nextImpactTimeSec !== undefined
      ? {
          label: activeIncident.aiInsight.nextImpactLabel,
          remainingSec: activeIncident.aiInsight.nextImpactTimeSec,
        }
      : null);
  const evacuationEta = getEvacuationEta(activeScenario, timelinePosition);

  return (
    <Card className="w-full p-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">AI Insight</p>
          {typeof confidence === "number" ? (
            <Badge tone={confidence >= 0.85 ? "success" : confidence >= 0.65 ? "warning" : "danger"}>
              {Math.round(confidence * 100)}% confidence
            </Badge>
          ) : null}
        </div>
        <div className="space-y-2">
          <p className="text-base font-semibold text-foreground" style={clampTextStyle(2)}>
            {activeIncident?.summary ?? "Sentra is monitoring all connected safety signals."}
          </p>
          <p className="text-sm leading-6 text-muted" style={clampTextStyle(3)}>
            {activeIncident?.aiInsight.recommendation ??
              "No intervention required. Stand by for the next validated signal."}
          </p>
        </div>
        {nextImpact || evacuationEta !== null ? (
          <div className="space-y-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface-strong)_72%,transparent)] px-3 py-2">
            {nextImpact ? (
              <p className="text-sm text-foreground">
                {nextImpact.label} in <span className="font-semibold">{nextImpact.remainingSec.toFixed(1)}s</span>
              </p>
            ) : null}
            {evacuationEta !== null ? (
              <p className="text-xs text-muted">
                Estimated completion in {evacuationEta.toFixed(1)}s
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </Card>
  );
});
