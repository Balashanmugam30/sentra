"use client";

import type { ReactNode } from "react";

export function omegaNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function omegaString(value: unknown, fallback = "operational") {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

export function omegaList<T = Record<string, unknown>>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function omegaRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export const omegaCompact = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  notation: "compact",
});

export function OmegaPanelShell({
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
      ? "rgba(245,158,11,0.2)"
      : tone === "danger"
        ? "rgba(248,113,113,0.16)"
        : "rgba(34,211,238,0.17)";

  return (
    <section
      className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(2,6,23,0.94),rgba(8,18,35,0.78))] p-5 shadow-[0_26px_80px_rgba(0,0,0,0.42)] backdrop-blur-2xl"
      style={{ boxShadow: `0 26px 80px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.055), 0 0 66px ${glow}` }}
    >
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-8 h-52 w-52 rounded-full bg-amber-300/8 blur-3xl" />
      <div className="relative flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/55">{eyebrow}</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-white">{title}</h3>
          {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="relative mt-5">{children}</div>
    </section>
  );
}

export function OmegaMetricCard({ label, note, value }: { label: string; note?: string; value: ReactNode }) {
  return (
    <div className="rounded-[23px] border border-white/10 bg-white/[0.045] p-4">
      <p className="text-[0.62rem] uppercase tracking-[0.18em] text-white/40">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{value}</p>
      {note ? <p className="mt-1 text-xs leading-5 text-cyan-50/56">{note}</p> : null}
    </div>
  );
}

export function OmegaBar({ label, max = 100, value }: { label: string; max?: number; value: number }) {
  const width = Math.max(4, Math.min(100, (value / Math.max(1, max)) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-white/50">
        <span>{label}</span>
        <span>{value.toLocaleString()}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-[linear-gradient(90deg,rgba(34,211,238,0.94),rgba(245,158,11,0.86))]" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export function OmegaPill({ children, tone = "cyan" }: { children: ReactNode; tone?: "cyan" | "gold" | "danger" }) {
  const color = tone === "gold" ? "border-amber-200/18 bg-amber-200/10 text-amber-50" : tone === "danger" ? "border-red-200/18 bg-red-200/10 text-red-50" : "border-cyan-200/18 bg-cyan-200/10 text-cyan-50";
  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${color}`}>{children}</span>;
}

export function OmegaActionButton({ busy, children, onClick }: { busy?: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      className="rounded-full border border-cyan-200/22 bg-cyan-200/10 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:-translate-y-0.5 hover:bg-cyan-200/16 disabled:translate-y-0 disabled:opacity-50"
      disabled={busy}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

