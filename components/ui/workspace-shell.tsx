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
          "sentra-workspace-hero sentra-phase7-hero sentra-phase11-hero sentra-phase12-hero rounded-[36px] border border-white/10 p-5 shadow-[0_28px_80px_rgba(0,0,0,0.32)] backdrop-blur-2xl md:p-7",
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
            <p className="sentra-phase12-eyebrow text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-cyan-100/54">
              {eyebrow}
            </p>
            <h1
              className="sentra-phase12-hero-title mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.06em] text-white md:text-6xl"
              id={`sentra-${mode}-workspace-title`}
            >
              {title}
            </h1>
            <p className="sentra-phase12-hero-copy mt-4 max-w-3xl text-sm leading-6 text-white/62 md:text-base">
              {description}
            </p>
            <div className="sentra-workspace-hero-actions mt-7 flex flex-wrap gap-3">
              {heroActions[mode].map((action) => (
                <Link
                  className={cn(
                    "sentra-hero-action-button",
                    action.tone === "primary" ? "is-primary" : "is-secondary",
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
