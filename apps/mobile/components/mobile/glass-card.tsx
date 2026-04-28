import type { ReactNode } from "react";

import { cn } from "../../lib/mobile/helpers";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  glow?: "accent" | "safe" | "warning" | "critical";
};

export function GlassCard({ children, className, glow = "accent" }: GlassCardProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.075] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl",
        glow === "accent" && "before:bg-blue-400/10",
        glow === "safe" && "before:bg-emerald-400/10",
        glow === "warning" && "before:bg-amber-400/10",
        glow === "critical" && "before:bg-red-400/10",
        "before:pointer-events-none before:absolute before:-right-16 before:-top-16 before:h-40 before:w-40 before:rounded-full before:blur-3xl",
        className,
      )}
    >
      <div className="relative">{children}</div>
    </section>
  );
}
