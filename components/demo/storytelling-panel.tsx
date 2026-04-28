"use client";

import type { DemoScene } from "@/lib/demo/types";

export function StorytellingPanel({ scene }: { scene: DemoScene }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">Presenter notes</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">What to say now</h2>
      <p className="mt-4 rounded-3xl border border-white/10 bg-black/25 p-4 text-lg leading-8 text-white/72">{scene.caption}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {Object.entries(scene.metrics).map(([key, value]) => (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3" key={key}>
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">{key.replaceAll("_", " ")}</p>
            <p className="mt-2 font-mono text-lg text-white">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

