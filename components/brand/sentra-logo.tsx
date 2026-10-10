"use client";

import Link from "next/link";
import type { Route } from "next";

interface SentraLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  href?: Route;
  className?: string;
}

export function SentraLogoMark({ size = "md", className = "" }: { size?: "sm" | "md" | "lg" | "xl"; className?: string }) {
  const dimMap = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-12 h-12",
  };

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${dimMap[size]} ${className}`}>
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="sentra-wave-grad-1" x1="2" y1="4" x2="34" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="50%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>
          <linearGradient id="sentra-wave-grad-2" x1="4" y1="18" x2="32" y2="18" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>

        {/* Outer protective geometric ring fragment */}
        <path
          d="M6 18C6 11.3726 11.3726 6 18 6C23.2 6 27.6 9.3 29.2 14"
          stroke="url(#sentra-wave-grad-1)"
          strokeWidth="2.75"
          strokeLinecap="round"
        />

        {/* Inner dynamic wave pulses */}
        <path
          d="M8 22C11 15 16 13 20 18C24 23 28 20 30 15"
          stroke="url(#sentra-wave-grad-2)"
          strokeWidth="2.75"
          strokeLinecap="round"
        />

        <path
          d="M10 28C13.5 25 17 25 21 28C24.5 30.5 27 28.5 28.5 26"
          stroke="url(#sentra-wave-grad-1)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeOpacity="0.75"
        />

        {/* Center telemetry node */}
        <circle cx="18" cy="18" r="2.25" fill="#2563EB" />
      </svg>
    </div>
  );
}

export function SentraLogo({
  size = "md",
  showWordmark = true,
  href = "/app" as Route,
  className = "",
}: SentraLogoProps) {
  const content = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      <SentraLogoMark size={size} />
      {showWordmark && (
        <div className="hidden sm:flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className="font-display font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors text-[1.125rem]">
              SENTRA
            </span>
            <span className="text-[0.65rem] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              OS
            </span>
          </div>
          <span className="text-[0.625rem] tracking-wider uppercase text-slate-600 font-medium mt-0.5">
            Crisis Intelligence
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
}
