import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export interface ConfidenceIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  score: number; // 0 to 100
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function getConfidenceTier(score: number): {
  label: string;
  color: string;
  barColor: string;
} {
  if (score >= 85) {
    return {
      label: "High Confidence",
      color: "text-emerald-400",
      barColor: "bg-emerald-400",
    };
  }
  if (score >= 60) {
    return {
      label: "Moderate Confidence",
      color: "text-cyan-400",
      barColor: "bg-cyan-400",
    };
  }
  if (score >= 40) {
    return {
      label: "Cautionary",
      color: "text-amber-400",
      barColor: "bg-amber-400",
    };
  }
  return {
    label: "Low / Provisional",
    color: "text-rose-400",
    barColor: "bg-rose-400",
  };
}

export function ConfidenceIndicator({
  className,
  score,
  showLabel = true,
  size = "md",
  ...props
}: ConfidenceIndicatorProps) {
  const normalized = Math.max(0, Math.min(100, Math.round(score)));
  const tier = getConfidenceTier(normalized);

  const barHeight = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-2.5",
  }[size];

  return (
    <div
      aria-label={`Intelligence confidence: ${normalized}%, ${tier.label}`}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={normalized}
      className={cn("w-full space-y-1.5", className)}
      role="progressbar"
      {...props}
    >
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-400">Model Calibration</span>
          <div className="flex items-center gap-1.5 font-mono tabular-nums">
            <span className={cn("font-semibold", tier.color)}>{tier.label}</span>
            <span className="text-white font-bold">{normalized}%</span>
          </div>
        </div>
      )}

      {/* Progress track */}
      <div className={cn("w-full overflow-hidden rounded-full bg-white/10 backdrop-blur-md", barHeight)}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_currentColor]",
            tier.barColor,
          )}
          style={{ width: `${normalized}%` }}
        />
      </div>
    </div>
  );
}
