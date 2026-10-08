import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { StatusDot, type StatusType } from "./status-dot";

export type StatusBadgeSize = "sm" | "md" | "lg";
export type StatusBadgeVariant = "glass" | "solid" | "outline";

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status?: StatusType;
  pulse?: boolean;
  showDot?: boolean;
  size?: StatusBadgeSize;
  variant?: StatusBadgeVariant;
  children?: ReactNode;
}

const statusTheme: Record<StatusType, { glass: string; solid: string; outline: string; text: string }> = {
  safe: {
    glass: "border-emerald-500/28 bg-emerald-500/12 text-emerald-300",
    solid: "border-emerald-600 bg-emerald-600 text-white",
    outline: "border-emerald-500/40 bg-transparent text-emerald-400",
    text: "Operational Normal",
  },
  warning: {
    glass: "border-amber-500/28 bg-amber-500/12 text-amber-300",
    solid: "border-amber-600 bg-amber-600 text-stone-950",
    outline: "border-amber-500/40 bg-transparent text-amber-400",
    text: "Elevated Caution",
  },
  critical: {
    glass: "border-rose-500/32 bg-rose-500/15 text-rose-300",
    solid: "border-rose-600 bg-rose-600 text-white",
    outline: "border-rose-500/50 bg-transparent text-rose-400",
    text: "Critical Event",
  },
  intelligence: {
    glass: "border-cyan-500/28 bg-cyan-500/12 text-cyan-300",
    solid: "border-cyan-600 bg-cyan-600 text-stone-950",
    outline: "border-cyan-500/40 bg-transparent text-cyan-400",
    text: "AI Intelligence",
  },
  info: {
    glass: "border-sky-500/28 bg-sky-500/12 text-sky-300",
    solid: "border-sky-600 bg-sky-600 text-white",
    outline: "border-sky-500/40 bg-transparent text-sky-400",
    text: "System Information",
  },
  offline: {
    glass: "border-slate-500/24 bg-slate-500/12 text-slate-300",
    solid: "border-slate-600 bg-slate-600 text-white",
    outline: "border-slate-500/40 bg-transparent text-slate-400",
    text: "Offline / Disconnected",
  },
  unknown: {
    glass: "border-slate-400/24 bg-slate-400/10 text-slate-300",
    solid: "border-slate-500 bg-slate-500 text-white",
    outline: "border-slate-400/40 bg-transparent text-slate-400",
    text: "Pending Verification",
  },
  executive: {
    glass: "border-amber-300/28 bg-amber-300/10 text-amber-200",
    solid: "border-amber-400 bg-amber-400 text-stone-950",
    outline: "border-amber-300/40 bg-transparent text-amber-300",
    text: "Executive Command",
  },
};

const sizeStyles: Record<StatusBadgeSize, string> = {
  sm: "px-2 py-0.5 text-[0.6875rem] font-medium gap-1.5",
  md: "px-2.5 py-1 text-xs font-semibold gap-2",
  lg: "px-3.5 py-1.5 text-sm font-semibold gap-2.5",
};

export function StatusBadge({
  children,
  className,
  pulse = false,
  showDot = true,
  size = "md",
  status = "info",
  variant = "glass",
  ...props
}: StatusBadgeProps) {
  const theme = statusTheme[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border backdrop-blur-md transition-all duration-200",
        theme[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {showDot && (
        <StatusDot
          pulse={pulse}
          size={size === "sm" ? "sm" : size === "lg" ? "lg" : "md"}
          status={status}
        />
      )}
      <span>{children ?? theme.text}</span>
    </span>
  );
}
