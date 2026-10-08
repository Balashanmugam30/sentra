import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { ConfidenceIndicator } from "./confidence-indicator";
import { GlassCard } from "./glass-card";
import { StatusBadge } from "./status-badge";
import type { StatusType } from "./status-dot";

export type VerificationState = "verified" | "hypothetical" | "contradicted" | "provisional";

export interface EvidenceCardProps extends HTMLAttributes<HTMLDivElement> {
  sourceName: string;
  sourceType?: string;
  timestamp: string;
  latencyMs?: number;
  verification: VerificationState;
  confidence: number; // 0-100
  title: string;
  excerpt: ReactNode;
  coordinates?: string;
  tags?: string[];
}

const verificationMap: Record<VerificationState, { status: StatusType; label: string }> = {
  verified: { status: "safe", label: "Multi-Sensor Confirmed" },
  hypothetical: { status: "intelligence", label: "Model Projection" },
  contradicted: { status: "warning", label: "Telemetry Divergence" },
  provisional: { status: "unknown", label: "Unconfirmed Stream" },
};

export function EvidenceCard({
  className,
  confidence,
  coordinates,
  excerpt,
  latencyMs,
  sourceName,
  sourceType,
  tags = [],
  timestamp,
  title,
  verification,
  ...props
}: EvidenceCardProps) {
  const verState = verificationMap[verification];

  return (
    <GlassCard
      className={cn("flex flex-col gap-4 p-5", className)}
      interactive
      tier="elevated"
      {...props}
    >
      {/* Top Header: Source & Verification Status */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <h4 className="text-sm font-semibold tracking-tight text-white">{sourceName}</h4>
            {sourceType && (
              <span className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                {sourceType}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 tabular-nums">
            <span>{timestamp}</span>
            {latencyMs !== undefined && <span>• {latencyMs}ms latency</span>}
            {coordinates && <span>• {coordinates}</span>}
          </div>
        </div>

        <StatusBadge size="sm" status={verState.status}>
          {verState.label}
        </StatusBadge>
      </div>

      {/* Title & Excerpt */}
      <div className="space-y-2">
        <h5 className="text-base font-semibold tracking-tight text-white">{title}</h5>
        <div className="rounded-xl border border-white/8 bg-black/25 p-3 text-xs leading-relaxed text-slate-300">
          {excerpt}
        </div>
      </div>

      {/* Confidence meter */}
      <ConfidenceIndicator score={confidence} size="sm" />

      {/* Tags footer */}
      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {tags.map((tag) => (
            <span
              className="rounded-lg border border-white/8 bg-white/[0.03] px-2 py-0.5 text-[11px] font-mono text-slate-400"
              key={tag}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
