"use client";

import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { motion } from "framer-motion";

import type { ModeSwitcherValue } from "@/components/ui/mode-switcher";
import { cn } from "@/lib/utils";

type WorkspaceShellProps = {
  children: ReactNode;
  className?: string;
  description: string;
  eyebrow: string;
  mode: ModeSwitcherValue;
  status?: ReactNode;
  title: string;
};

const heroActions: Record<ModeSwitcherValue, Array<{ href: Route; label: string; tone?: "primary" }>> = {
  command: [
    { href: "/incidents", label: "Open incidents", tone: "primary" },
    { href: "/ai-council", label: "View recommendations" },
  ],
  crisis: [
    { href: "/incidents", label: "Open incidents", tone: "primary" },
    { href: "/operations/resources", label: "View response plan" },
  ],
  demo: [
    { href: "/demo", label: "Run showcase", tone: "primary" },
    { href: "/analytics", label: "View evidence" },
  ],
  executive: [
    { href: "/analytics", label: "Open analytics", tone: "primary" },
    { href: "/executive", label: "Board briefing" },
  ],
};

export function WorkspaceShell({
  children,
  className,
  description,
  eyebrow,
  mode,
  status,
  title,
}: WorkspaceShellProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 pb-12 pt-4 md:px-6 lg:px-8",
        className,
      )}
      data-dashboard-mode={mode}
    >
      <motion.section
        aria-labelledby={`sentra-${mode}-workspace-title`}
        className={cn(
          "sentra-workspace-hero relative overflow-hidden rounded-[32px] border border-white/[0.12] bg-[linear-gradient(135deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.015)_100%)] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.48),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-2xl before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent md:p-8",
          `sentra-phase7-hero-${mode}`,
        )}
        data-mode={mode}
        layout
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: "easeOut" }}
      >
        <span aria-hidden="true" className="sentra-phase12-hero-orb sentra-phase12-hero-orb-one" />
        <span aria-hidden="true" className="sentra-phase12-hero-orb sentra-phase12-hero-orb-two" />
        <span aria-hidden="true" className="sentra-phase12-hero-scanline" />
        <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_minmax(360px,560px)] xl:items-start">
          <div className="min-w-0 pt-1">
            <p className="sentra-phase12-eyebrow font-mono text-[0.68rem] font-bold uppercase tracking-[0.26em] text-cyan-300/80">
              {eyebrow}
            </p>
            <h1
              className="sentra-phase12-hero-title font-display mt-3 max-w-4xl text-3xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl bg-gradient-to-r from-white via-white/95 to-white/70 bg-clip-text text-transparent"
              id={`sentra-${mode}-workspace-title`}
            >
              {title}
            </h1>
            <p className="sentra-phase12-hero-copy font-sans mt-3.5 max-w-3xl text-sm leading-relaxed text-white/65 md:text-base">
              {description}
            </p>
            <div className="sentra-workspace-hero-actions mt-7 flex flex-wrap gap-3">
              {heroActions[mode].map((action) => (
                <Link
                  className={cn(
                    "sentra-hero-action-button rounded-xl border border-white/12 bg-white/[0.05] px-4 py-2.5 text-xs font-semibold text-white/90 backdrop-blur-xl transition hover:border-cyan-400/35 hover:bg-white/[0.1] hover:text-white hover:shadow-[0_0_20px_rgba(56,189,248,0.15)]",
                    action.tone === "primary" ? "border-cyan-400/30 bg-cyan-500/15 text-cyan-100 shadow-[0_0_20px_rgba(56,189,248,0.18)]" : "",
                  )}
                  href={action.href}
                  key={action.href}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="sentra-phase12-status-panel space-y-4">
            {status ? <div>{status}</div> : null}
          </div>
        </div>
      </motion.section>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="sentra-workspace-enter sentra-phase7-content"
        initial={{ opacity: 0, y: 12 }}
        key={mode}
        transition={{ duration: 0.38, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
