"use client";

import type { ReactNode } from "react";

export const ecosystemMoney = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});

export const ecosystemNumber = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

export function EcosystemPanelShell({
  action,
  children,
  description,
  eyebrow,
  title,
  tone = "cyan",
}: {
  action?: ReactNode;
  children: ReactNode;
  description?: string;
  eyebrow: string;
  title: string;
  tone?: "cyan" | "gold" | "danger";
}) {
  const glow =
    tone === "gold"
      ? "rgba(245,158,11,0.14)"
      : tone === "danger"
        ? "rgba(248,113,113,0.12)"
        : "rgba(34,211,238,0.13)";

  return (
    <section
      className="rounded-[30px] border border-white/10 bg-[rgba(3,9,21,0.79)] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.32)] backdrop-blur-2xl"
      style={{ boxShadow: `0 24px 70px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 54px ${glow}` }}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[0.64rem] font-semibold uppercase tracking-[0.23em] text-cyan-100/55">{eyebrow}</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-white">{title}</h3>
          {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function EcosystemMetricCard({ label, note, value }: { label: string; note?: string; value: ReactNode }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4">
      <p className="text-[0.62rem] uppercase tracking-[0.18em] text-white/40">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {note ? <p className="mt-1 text-xs text-cyan-50/56">{note}</p> : null}
    </div>
  );
}

export function EcosystemBar({ label, max = 100, value }: { label: string; max?: number; value: number }) {
  const width = Math.max(4, Math.min(100, (value / Math.max(1, max)) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-white/50">
        <span>{label}</span>
        <span>{ecosystemNumber.format(value)}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-[linear-gradient(90deg,rgba(34,211,238,0.86),rgba(245,158,11,0.76))]" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export function EcosystemActionButton({
  busy,
  children,
  onClick,
}: {
  busy?: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className="rounded-full border border-cyan-200/22 bg-cyan-200/10 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-200/16 disabled:opacity-50"
      disabled={busy}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
