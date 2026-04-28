"use client";

import type { DemoScene } from "@/lib/demo/types";

export function DemoStage({ scene, activeIndex, total }: { scene: DemoScene; activeIndex: number; total: number }) {
  return (
    <section className="relative overflow-hidden rounded-[42px] border border-white/10 bg-[radial-gradient(circle_at_26%_16%,rgba(34,211,238,0.2),transparent_34%),radial-gradient(circle_at_84%_22%,rgba(248,113,113,0.16),transparent_30%),rgba(255,255,255,0.055)] p-7 shadow-[0_30px_140px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
      <div className="absolute right-8 top-8 hidden h-28 w-28 rounded-full border border-cyan-200/20 bg-cyan-200/10 blur-xl md:block" />
      <div className="relative z-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <span className="w-fit rounded-full border border-white/10 bg-black/25 px-4 py-2 font-mono text-xs text-cyan-100">Scene {activeIndex + 1} / {total}</span>
          <span className="w-fit rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">Live keynote mode</span>
        </div>
        <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.055em] text-white md:text-6xl">{scene.title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-white/62">{scene.what_happened}</p>
        <div className="mt-7 grid gap-4 lg:grid-cols-3">
          <StoryPillar label="Why Sentra wins" value={scene.why_sentra_wins} />
          <StoryPillar label="AI reasoning" value={scene.ai_reasoning} />
          <StoryPillar label="Next action" value={scene.next_action} />
        </div>
      </div>
    </section>
  );
}

function StoryPillar({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/38">{label}</p>
      <p className="mt-3 text-sm leading-6 text-white/65">{value}</p>
    </div>
  );
}

