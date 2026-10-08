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

