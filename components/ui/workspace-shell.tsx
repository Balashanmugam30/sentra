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
        "mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-4 pb-12 pt-3 md:px-6 lg:px-8",
        className,
      )}
      data-dashboard-mode={mode}
    >
      <motion.section
        aria-labelledby={`sentra-${mode}-workspace-title`}
        className={cn(
          "sentra-workspace-hero relative overflow-hidden rounded-xl border border-[#E4E9E1] bg-white p-5 shadow-xs md:p-6",
          `sentra-phase7-hero-${mode}`,
        )}
        data-mode={mode}
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#84CC16] via-[#06B6D4] to-[#A855F7]" />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="sentra-phase12-eyebrow font-mono text-[0.68rem] font-semibold uppercase tracking-wider text-[#65A30D]">
              {eyebrow}
            </p>
            <h1
              className="sentra-phase12-hero-title font-display mt-1 text-2xl font-bold tracking-tight text-[#1F2937] md:text-3xl"
              id={`sentra-${mode}-workspace-title`}
            >
              {title}
            </h1>
            <p className="sentra-phase12-hero-copy font-sans mt-1 max-w-2xl text-xs leading-relaxed text-[#586579] md:text-sm">
              {description}
            </p>
          </div>
          <div className="sentra-workspace-hero-actions flex shrink-0 flex-wrap items-center gap-2.5">
            {heroActions[mode].map((action) => (
              <Link
                className={cn(
                  "sentra-hero-action-button inline-flex items-center rounded-lg border px-3.5 py-1.5 text-xs font-medium transition",
                  action.tone === "primary"
                    ? "border-[#1F2937] bg-[#1F2937] text-white shadow-xs hover:bg-black"
                    : "border-[#E4E9E1] bg-[#F1F5F0] text-[#1F2937] hover:bg-[#E4E9E1]",
                )}
                href={action.href}
                key={action.href}
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </motion.section>

      {status ? (
        <section aria-label="Key operational metrics" className="w-full">
          {status}
        </section>
      ) : null}

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="sentra-workspace-enter sentra-phase7-content"
        initial={{ opacity: 0, y: 8 }}
        key={mode}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
