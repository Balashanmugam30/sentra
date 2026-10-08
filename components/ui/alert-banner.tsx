import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { StatusBadge } from "./status-badge";
import type { StatusType } from "./status-dot";

export interface AlertBannerProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  severity?: "critical" | "warning" | "safe" | "intelligence" | "info";
  title: ReactNode;
  description?: ReactNode;
  timestamp?: string;
  action?: ReactNode;
  onDismiss?: () => void;
  pulse?: boolean;
}

const severityBorderStyles: Record<string, string> = {
  critical: "border-rose-500/35 bg-rose-500/[0.08] text-rose-100",
  warning: "border-amber-500/35 bg-amber-500/[0.08] text-amber-100",
  safe: "border-emerald-500/35 bg-emerald-500/[0.08] text-emerald-100",
  intelligence: "border-cyan-500/35 bg-cyan-500/[0.08] text-cyan-100",
  info: "border-sky-500/35 bg-sky-500/[0.08] text-sky-100",
};

export function AlertBanner({
  action,
  className,
  description,
  onDismiss,
  pulse = false,
  severity = "warning",
  timestamp,
  title,
  ...props
}: AlertBannerProps) {
  return (
    <aside
      aria-live="polite"
      className={cn(
        "relative overflow-hidden rounded-2xl border p-4 backdrop-blur-xl transition-all duration-200",
        "before:pointer-events-none before:absolute before:inset-x-4 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
        severityBorderStyles[severity],
        className,
      )}
      role="alert"
      {...props}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <StatusBadge
            pulse={pulse || severity === "critical"}
            size="sm"
            status={severity as StatusType}
          />
          <div className="space-y-1">
            <div className="flex flex-wrap items-baseline gap-2">
              <h3 className="text-sm font-semibold tracking-tight text-white">{title}</h3>
              {timestamp && (
                <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                  {timestamp}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {action}
          {onDismiss && (
            <button
              aria-label="Dismiss alert"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
              onClick={onDismiss}
              type="button"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M18 6 6 18M6 6l12 12" strokeWidth="2" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
