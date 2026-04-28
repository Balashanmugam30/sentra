"use client";

import { platformTone } from "@/lib/platform/runtime";
import type { PlatformSummary } from "@/lib/platform/types";

export function DeveloperScore({ summary }: { summary: PlatformSummary }) {
  const metrics = [
    { label: "Active Devs", value: summary.active_developers },
    { label: "Apps", value: summary.apps_created },
    { label: "Docs Views", value: summary.docs_usage },
    { label: "SDK Downloads", value: summary.sdk_downloads },
    { label: "Builder Growth", value: `${summary.builder_growth_percent}%` },
    { label: "Sandbox Runs", value: summary.sandbox_runs },
  ];

  return (
    <section className="rounded-[32px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/60">Developer Ecosystem</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">Builder readiness score</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
            Public APIs, docs, SDK packages, sandbox runs, and app adoption are measured as one tenant-safe platform posture.
          </p>
        </div>
        <div className={`rounded-[28px] border px-6 py-5 text-center ${platformTone(summary.developer_ecosystem_score)}`}>
          <p className="text-xs uppercase tracking-[0.22em] opacity-70">Score</p>
          <p className="mt-2 font-mono text-5xl">{summary.developer_ecosystem_score}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {metrics.map((metric) => (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4" key={metric.label}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">{metric.label}</p>
            <p className="mt-2 font-mono text-2xl text-white">{metric.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

