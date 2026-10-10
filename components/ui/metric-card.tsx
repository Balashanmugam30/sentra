import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { GlassCard } from "./glass-card";
import { StatusBadge } from "./status-badge";
import type { StatusType } from "./status-dot";

export type MetricTrend = "up" | "down" | "neutral";

export interface MetricCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  delta?: string | number;
  trend?: MetricTrend;
  trendLabel?: string;
  unit?: string;
  status?: StatusType;
  statusLabel?: string;
  hint?: string;
  icon?: ReactNode;
  interactive?: boolean;
}

const trendStyles: Record<MetricTrend, { text: string; icon: string; bg: string }> = {
  up: {
    text: "text-emerald-400",
    icon: "↑",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  down: {
    text: "text-rose-400",
    icon: "↓",
    bg: "bg-rose-500/10 border-rose-500/20",
  },
  neutral: {
    text: "text-slate-400",
    icon: "→",
    bg: "bg-slate-500/10 border-slate-500/20",
  },
};

export function MetricCard({
  className,
  delta,
  hint,
  icon,
  interactive = false,
  label,
  status,
  statusLabel,
  trend,
  trendLabel,
  unit,
  value,
  ...props
}: MetricCardProps) {
  return (
    <GlassCard
      className={cn("flex flex-col justify-between gap-3 p-5", className)}
      interactive={interactive}
      tier="elevated"
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{label}</p>
          {status && (
            <StatusBadge size="sm" status={status}>
              {statusLabel}
            </StatusBadge>
          )}
        </div>
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sky-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-cyan-400">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-1">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {value}
          </span>
          {unit && <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{unit}</span>}
        </div>

        {(delta !== undefined || trend || hint) && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-semibold tabular-nums",
                  trendStyles[trend].bg,
                  trendStyles[trend].text,
                )}
              >
                <span>{trendStyles[trend].icon}</span>
                {delta !== undefined && <span>{delta}</span>}
                {trendLabel && <span>{trendLabel}</span>}
              </span>
            )}
            {hint && <span className="text-slate-400 leading-relaxed">{hint}</span>}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

// Backwards compatibility for existing imports
export function MinimalMetricCard({
  className,
  delta: _delta,
  hint,
  icon: _icon,
  interactive: _interactive,
  label,
  status: _status,
  statusLabel: _statusLabel,
  trend: _trend,
  trendLabel: _trendLabel,
  unit: _unit,
  value,
  ...props
}: MetricCardProps) {
  return (
    <div className={cn("sentra-phase6-metric-card", className)} {...props}>
      <p className="sentra-phase6-label">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-white tabular-nums">
        {value}
      </p>
      {hint ? <p className="mt-2 text-sm leading-6 text-white/52">{hint}</p> : null}
    </div>
  );
}

