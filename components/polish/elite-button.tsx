"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export function EliteButton({ children, variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: "primary" | "ghost" | "danger" }) {
  const className = {
    primary: "bg-white text-slate-950 hover:bg-cyan-100",
    ghost: "border border-white/10 bg-white/[0.05] text-white hover:bg-white/10",
    danger: "border border-rose-300/25 bg-rose-300/10 text-rose-100 hover:bg-rose-300/15",
  }[variant];
  return (
    <button {...props} className={`rounded-2xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 ${className} ${props.className ?? ""}`} type={props.type ?? "button"}>
      {children}
    </button>
  );
}

