"use client";

import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

const NAV_ITEMS: { href: Route; label: string }[] = [
  { href: "/platform/developers" as Route, label: "Developers" },
  { href: "/platform/apis" as Route, label: "APIs" },
  { href: "/platform/webhooks" as Route, label: "Webhooks" },
  { href: "/platform/usage" as Route, label: "Usage" },
  { href: "/platform/marketplace" as Route, label: "Marketplace" },
  { href: "/platform/apps" as Route, label: "Apps" },
  { href: "/platform/partners" as Route, label: "Partners" },
  { href: "/platform/revenue" as Route, label: "Revenue" },
  { href: "/platform/whitelabel" as Route, label: "White Label" },
  { href: "/platform/channel" as Route, label: "Channel" },
  { href: "/platform/global-partners" as Route, label: "Global Partners" },
  { href: "/platform/expansion" as Route, label: "Expansion" },
];

export function PlatformShell({
  eyebrow,
  title,
  subtitle,
  loading,
  error,
  lastAction,
  onRefresh,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  loading: boolean;
  error: string | null;
  lastAction: string | null;
  onRefresh: () => Promise<void>;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen overflow-hidden bg-[#02040a] px-5 py-8 text-white md:px-8">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.16),transparent_34%),radial-gradient(circle_at_82%_16%,rgba(16,185,129,0.12),transparent_32%),radial-gradient(circle_at_48%_100%,rgba(59,130,246,0.1),transparent_32%),linear-gradient(180deg,#02040a_0%,#030712_100%)]" />
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-[34px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-100/70">{eyebrow}</p>
              <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.045em] text-white md:text-5xl">{title}</h1>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-white/55">{subtitle}</p>
            </div>
            <button className="w-fit rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60" disabled={loading} onClick={() => void onRefresh()} type="button">
              {loading ? "Refreshing" : "Refresh"}
            </button>
          </div>
          <nav className="mt-6 flex flex-wrap gap-2">
            {NAV_ITEMS.map((item) => (
              <Link className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/65 transition hover:bg-white/10 hover:text-white" href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          {(error || lastAction) && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/60">
              {error ? `Resilient mode: ${error}` : lastAction}
            </div>
          )}
        </header>
        {children}
      </div>
    </main>
  );
}

export function PlatformKpi({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">{label}</p>
      <p className="mt-3 font-mono text-3xl text-white">{value}</p>
    </div>
  );
}
