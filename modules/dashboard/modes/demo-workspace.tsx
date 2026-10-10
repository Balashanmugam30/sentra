"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionTitle } from "@/components/ui/section-title";

import type { ModeWorkspaceProps } from "@/modules/dashboard/modes/types";

const demoFlow = [
  {
    title: "Calm building",
    detail: "Sentra monitors live facility, identity, security, and operations signals in one place.",
  },
  {
    title: "Incident detected",
    detail: "Live data updates the command surface and risk engine without forcing operators to hunt.",
  },
  {
    title: "AI predicts spread",
    detail: "The twin, behavior layer, and SOC signals converge into a single recommended action path.",
  },
  {
    title: "Response orchestrated",
    detail: "Teams, communications, and executive reporting align around one verified operating picture.",
  },
];

export function DemoWorkspace({ metrics, onModeChange }: ModeWorkspaceProps) {
  return (
    <div className="space-y-6" data-section-id="demo-workspace">
      <GlassPanel as="section" className="min-h-[520px] p-7 md:p-10" tone="hero" data-section-id="demo-hero">
        <div className="grid gap-8 xl:grid-cols-[1fr_0.86fr] xl:items-center">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-sky-600 dark:text-cyan-100/56">
              Investor showcase
            </p>
            <h2 className="mt-4 max-w-4xl text-5xl font-semibold tracking-[-0.07em] text-slate-900 dark:text-white md:text-7xl">
              Sentra turns chaos into command.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-white/62">
              A guided product story for judges, investors, clients, and government buyers. No raw
              dashboard clutter, only the narrative that proves why Sentra wins.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={() => onModeChange("crisis")}>Skip to climax</Button>
              <Link className="sentra-command-link" href="/demo">
                Open full demo engine
              </Link>
            </div>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5 dark:border-white/10 dark:bg-black/22">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Casualty risk", "-42%"],
                ["Response speed", "+61%"],
                ["Downtime", "-55%"],
                ["AI confidence", `${metrics.aiConfidence}%`],
              ].map(([label, value]) => (
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.045] dark:shadow-none" key={label}>
                  <p className="text-[0.66rem] uppercase tracking-[0.22em] text-slate-500 dark:text-white/42">{label}</p>
                  <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-slate-900 dark:text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassPanel>

      <div className="grid gap-5 xl:grid-cols-[0.88fr_1.12fr]">
        <GlassPanel as="section" data-section-id="demo-timeline">
          <SectionTitle eyebrow="Cinematic flow" title="Guided crisis scenario timeline" />
          <div className="mt-6 space-y-4">
            {demoFlow.map((scene, index) => (
              <div className="flex gap-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04]" key={scene.title}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sm font-semibold text-sky-700 dark:border-cyan-200/18 dark:bg-cyan-200/10 dark:text-cyan-50">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{scene.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-white/54">{scene.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel as="section" tone="quiet" data-section-id="demo-proof">
          <SectionTitle
            description="The demo mode intentionally shows curated proof, not every operator widget."
            eyebrow="Why Sentra wins"
            title="AI + operations + trust in one story"
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              ["Predict", "Forecasts incident, crowd, cyber, and continuity risk before escalation."],
              ["Decide", "AI council compares response strategies and explains the winning plan."],
              ["Execute", "Operations workflows dispatch teams, alerts, and recovery actions."],
              ["Prove", "Executive reporting turns the response into board-ready evidence."],
            ].map(([label, copy]) => (
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-black/18" key={label}>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-white/56">{copy}</p>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
