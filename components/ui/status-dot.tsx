import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type StatusType =
  | "safe"
  | "warning"
  | "critical"
  | "intelligence"
  | "info"
  | "offline"
  | "unknown"
  | "executive";

export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
  status?: StatusType;
  pulse?: boolean;
  size?: "sm" | "md" | "lg";
}

const dotStyles: Record<StatusType, string> = {
  safe: "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
  warning: "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
  critical: "bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]",
  intelligence: "bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]",
  info: "bg-sky-400 shadow-[0_0_8px_rgba(14,165,233,0.5)]",
  offline: "bg-slate-500",
  unknown: "bg-slate-400",
  executive: "bg-amber-300 shadow-[0_0_8px_rgba(245,213,138,0.5)]",
};

const pulseStyles: Record<StatusType, string> = {
  safe: "bg-emerald-400/40",
  warning: "bg-amber-400/40",
  critical: "bg-rose-500/50",
  intelligence: "bg-cyan-400/40",
  info: "bg-sky-400/40",
  offline: "bg-transparent",
  unknown: "bg-transparent",
  executive: "bg-amber-300/40",
};

const sizeStyles = {
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
  lg: "h-2.5 w-2.5",
};

const pulseRingSizes = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function StatusDot({
  className,
  pulse = false,
  size = "md",
  status = "info",
  ...props
}: StatusDotProps) {
  return (
    <span className="relative inline-flex items-center justify-center shrink-0" {...props}>
      {pulse && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute rounded-full animate-ping opacity-75",
            pulseRingSizes[size],
            pulseStyles[status],
          )}
        />
      )}
      <span
        aria-hidden="true"
        className={cn("rounded-full", sizeStyles[size], dotStyles[status], className)}
      />
    </span>
  );
}
