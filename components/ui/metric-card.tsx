import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type MetricCardProps = HTMLAttributes<HTMLDivElement> & {
  hint?: string;
  label: string;
  value: string | number;
};

export function MinimalMetricCard({ className, hint, label, value, ...props }: MetricCardProps) {
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
