import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type CardVariant = "hero" | "standard" | "quiet" | "danger";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const cardVariants: Record<CardVariant, string> = {
  hero: "sentra-card-hero",
  standard: "sentra-card-standard",
  quiet: "sentra-card-quiet",
  danger: "sentra-card-danger",
};

export function Card({ className, variant = "standard", ...props }: CardProps) {
  return (
    <div
      className={cn(
        "sentra-card",
        cardVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function SectionCard({ className, variant = "standard", ...props }: CardProps) {
  return <section className={cn("sentra-card", cardVariants[variant], className)} {...props} />;
}

interface MetricCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  hint?: string;
}

export function MetricCard({ className, hint, label, value, ...props }: MetricCardProps) {
  return (
    <div className={cn("sentra-card sentra-card-standard", className)} {...props}>
      <p className="sentra-caption text-[var(--text-muted)]">{label}</p>
      <p className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-[var(--text-primary)] tabular-nums">
        {value}
      </p>
      {hint ? <p className="mt-2 text-sm text-[var(--text-secondary)]">{hint}</p> : null}
    </div>
  );
}
