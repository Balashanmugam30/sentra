import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type StatusTone = "danger" | "live" | "neutral" | "warning";

type StatusPillProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: StatusTone;
};

const toneStyles: Record<StatusTone, string> = {
  danger: "border-[rgba(255,125,125,0.22)] bg-[rgba(255,125,125,0.09)] text-[#ffd1d1]",
  live: "border-[rgba(124,231,178,0.22)] bg-[rgba(124,231,178,0.09)] text-[#cbf8de]",
  neutral: "border-white/10 bg-white/[0.055] text-white/62",
  warning: "border-[rgba(244,197,106,0.22)] bg-[rgba(244,197,106,0.09)] text-[#ffe8b0]",
};

export function StatusPill({ className, tone = "neutral", ...props }: StatusPillProps) {
  return <span className={cn("sentra-phase6-status-pill", toneStyles[tone], className)} {...props} />;
}
