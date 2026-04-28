import type { ReactNode } from "react";

export function opsNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function opsString(value: unknown, fallback = "ready"): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

export function opsRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function opsList<T = Record<string, unknown>>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function OpsPanelChrome({ title, eyebrow, children, action }: { title: string; eyebrow: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-cyan-300/25 bg-gradient-to-br from-cyan-400/12 to-slate-950/75 p-5 shadow-[0_24px_80px_rgba(0,16,40,0.42)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.14),transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_40%)]" />
      <div className="relative z-10 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-100/60">{eyebrow}</p>
            <h3 className="mt-1 text-xl font-semibold text-white">{title}</h3>
          </div>
          {action}
        </div>
        {children}
      </div>
    </section>
  );
}

export function OpsMetricTile({ label, value, tone = "cyan" }: { label: string; value: string | number; tone?: "cyan" | "gold" | "red" }) {
  const color = tone === "gold" ? "text-amber-200" : tone === "red" ? "text-red-100" : "text-cyan-100";
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300/60">{label}</p>
      <div className={`mt-2 text-2xl font-semibold ${color}`}>{value}</div>
    </div>
  );
}

export function OpsButton({ children, onClick, disabled }: { children: ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-full border border-cyan-200/30 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-50 transition hover:-translate-y-0.5 hover:bg-cyan-300/16 disabled:cursor-wait disabled:opacity-55"
    >
      {children}
    </button>
  );
}

