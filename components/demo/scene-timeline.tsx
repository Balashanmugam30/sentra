"use client";

import type { DemoScene } from "@/lib/demo/types";

export function SceneTimeline({ scenes, activeIndex }: { scenes: DemoScene[]; activeIndex: number }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">Story timeline</p>
      <div className="mt-5 space-y-3">
        {scenes.map((scene, index) => (
          <div className={`rounded-3xl border p-4 transition ${index === activeIndex ? "border-cyan-200/40 bg-cyan-200/10" : "border-white/10 bg-black/25"}`} key={scene.scene_id}>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-white/40">{String(scene.order).padStart(2, "0")}</span>
              <h3 className="font-semibold text-white">{scene.title}</h3>
            </div>
            <p className="mt-2 text-sm text-white/45">{scene.next_action}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

