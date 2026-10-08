"use client";

import { useEffect, useRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface GlassDialogProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

const maxWidthStyles = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

export function GlassDialog({
  children,
  className,
  description,
  maxWidth = "md",
  onClose,
  open,
  title,
  ...props
}: GlassDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-[#030712]/75 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Dialog Surface (Glass Tier 3) */}
      <div
        className={cn(
          "relative z-10 w-full overflow-hidden rounded-[28px] border border-white/18",
          "bg-[linear-gradient(180deg,rgba(15,23,42,0.92)_0%,rgba(7,13,27,0.95)_100%)] p-6 sm:p-8",
          "backdrop-blur-2xl shadow-[0_28px_80px_rgba(0,0,0,0.7),0_0_1px_1px_rgba(255,255,255,0.15)]",
          "before:pointer-events-none before:absolute before:inset-x-8 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/35 before:to-transparent",
          maxWidthStyles[maxWidth],
          className,
        )}
        ref={dialogRef}
        {...props}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            {title && (
              <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
            )}
          </div>
          <button
            aria-label="Close dialog"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
            onClick={onClose}
            type="button"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
