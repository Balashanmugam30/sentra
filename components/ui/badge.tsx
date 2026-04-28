import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type BadgeTone = "primary" | "live" | "success" | "warning" | "danger" | "neutral";

const toneStyles: Record<BadgeTone, string> = {
  primary:
    "border-[rgba(110,168,255,0.24)] bg-[rgba(110,168,255,0.1)] text-[#d6e6ff]",
  live: "border-[rgba(110,168,255,0.24)] bg-[rgba(110,168,255,0.12)] text-[#d6e6ff]",
  success:
    "border-[rgba(52,211,153,0.24)] bg-[rgba(52,211,153,0.11)] text-emerald-100",
  warning:
    "border-[rgba(251,191,36,0.26)] bg-[rgba(251,191,36,0.1)] text-amber-100",
  danger:
    "border-[rgba(248,113,113,0.28)] bg-[rgba(248,113,113,0.11)] text-red-100",
  neutral: "border-[var(--border-soft)] bg-[rgba(255,255,255,0.055)] text-[var(--text-secondary)]",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ className, tone = "primary", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
        toneStyles[tone],
        className,
      )}
      {...props}
    />
  );
}
