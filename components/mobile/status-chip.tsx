"use client";

import { STATUS_COPY } from "@/lib/mobile/constants";
import { cn, statusTone } from "@/lib/mobile/helpers";
import type { SystemStatus } from "@/lib/mobile/types";

type StatusChipProps = {
  status: SystemStatus;
};

export function StatusChip({ status }: StatusChipProps) {
  const tone = statusTone(status);

  return (
    <span
      className={cn(
        "inline-flex min-h-10 items-center rounded-full border px-3 text-xs font-semibold tracking-[0.18em]",
        tone === "safe" && "border-emerald-300/30 bg-emerald-400/12 text-emerald-100 shadow-[0_0_24px_rgba(16,185,129,0.16)]",
        tone === "warning" && "border-amber-300/35 bg-amber-400/13 text-amber-100 shadow-[0_0_24px_rgba(245,158,11,0.16)]",
        tone === "critical" && "border-red-300/35 bg-red-400/13 text-red-100 shadow-[0_0_24px_rgba(248,113,113,0.18)]",
      )}
    >
      {STATUS_COPY[status].label}
    </span>
  );
}
