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
          "sentra-workspace-hero relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-6",
          `sentra-phase7-hero-${mode}`,
        )}
        data-mode={mode}
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="sentra-phase12-eyebrow font-mono text-[0.68rem] font-semibold uppercase tracking-wider text-slate-500 dark:text-cyan-400">
              {eyebrow}
            </p>
            <h1
              className="sentra-phase12-hero-title font-display mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-3xl"
              id={`sentra-${mode}-workspace-title`}
            >
              {title}
            </h1>
            <p className="sentra-phase12-hero-copy font-sans mt-1 max-w-2xl text-xs leading-relaxed text-slate-600 dark:text-slate-400 md:text-sm">
              {description}
            </p>
          </div>
          <div className="sentra-workspace-hero-actions flex shrink-0 flex-wrap items-center gap-2.5">
            {heroActions[mode].map((action) => (
              <Link
                className={cn(
                  "sentra-hero-action-button inline-flex items-center rounded-lg border px-3.5 py-1.5 text-xs font-medium transition",
                  action.tone === "primary"
                    ? "border-slate-900 bg-slate-900 text-white shadow-sm hover:bg-slate-800 dark:border-sky-500 dark:bg-sky-600 dark:hover:bg-sky-500"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
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
