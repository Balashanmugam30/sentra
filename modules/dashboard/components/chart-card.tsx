"use client";

import type { ReactNode } from "react";

export function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div
      className="rounded-[22px] border p-4"
      style={{
        borderColor: "var(--sentra-border-subtle)",
        background: "var(--surface-soft)",
      }}
    >
      <div className="mb-4">
        <h3 className="text-sm font-medium text-[var(--text)]">{title}</h3>
        <p className="mt-1 text-xs" style={{ color: "var(--sentra-text-muted)" }}>
          {subtitle}
        </p>
      </div>
      <div className="h-56 w-full">{children}</div>
    </div>
  );
}

