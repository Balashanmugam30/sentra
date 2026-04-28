"use client";

import { memo } from "react";

import { Badge, Card } from "@/components/ui";
import { useActiveIncident } from "@/hooks/use-active-incident";
import { useSystemStatus } from "@/hooks/use-system-status";
import { useDemoStore } from "@/store/demo-store";

export const DecisionExplainer = memo(function DecisionExplainer() {
  const activeIncident = useActiveIncident();
  const { priority } = useSystemStatus();
  const currentPhase = useDemoStore((state) => state.currentPhase);

  if (!activeIncident?.aiInsight?.explanation) {
    return null;
  }

  return (
    <Card className="w-full max-w-[24rem] p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">Decision Logic</p>
          <Badge tone={priority === "high" ? "danger" : priority === "medium" ? "warning" : "primary"}>
            {currentPhase ?? "Live basis"}
          </Badge>
        </div>
        <p className="text-sm leading-6 text-foreground">{activeIncident.aiInsight.explanation}</p>
      </div>
    </Card>
  );
});
