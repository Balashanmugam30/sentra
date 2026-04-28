"use client";

import Link from "next/link";

import { CinematicDemoJourney } from "@/components/demo/cinematic-demo-journey";
import { DemoControls } from "@/components/demo/demo-controls";
import { DemoStage } from "@/components/demo/demo-stage";
import { SceneTimeline } from "@/components/demo/scene-timeline";
import { ScreenplayCaptions } from "@/components/demo/screenplay-captions";
import { StorytellingPanel } from "@/components/demo/storytelling-panel";
import { WowMetrics } from "@/components/demo/wow-metrics";
import { LaunchShell } from "@/components/polish/launch-shell";
import { PremiumCard } from "@/components/polish/premium-card";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useDemo } from "@/lib/demo/use-demo";
import { SENTRA_SHOWCASE_PATH } from "@/lib/product-positioning";

const SCENARIOS = ["fire", "gas", "panic", "cyber", "multiincident"] as const;

export default function DemoPage() {
  const demo = useDemo();

  return (
    <ProtectedWorkspaceShell>
      <LaunchShell
        eyebrow="Guided showcase"
        title="Two-minute Sentra product story"
        subtitle="Walk from calm operations to active incident, AI prediction, command decisions, executive evidence, and recovery in one recruiter- and judge-ready narrative."
      >
        <WowMetrics metrics={demo.summary.wow_metrics} />
        <PremiumCard title="Recommended showcase arc" eyebrow="Problem -> Solution -> Intelligence -> Impact" accent="cyan">
          <div className="grid gap-3 md:grid-cols-4">
            {SENTRA_SHOWCASE_PATH.map((step, index) => (
              <Link
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 transition hover:border-cyan-100/20 hover:bg-white/[0.07]"
                href={step.href}
                key={step.label}
              >
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/36">0{index + 1}</span>
                <span className="mt-2 block text-sm font-semibold text-white">{step.label}</span>
              </Link>
            ))}
          </div>
        </PremiumCard>
        <CinematicDemoJourney activeIndex={demo.activeIndex} />
        <DemoStage scene={demo.activeScene} activeIndex={demo.activeIndex} total={demo.scenes.scenes.length} />
        <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
          <SceneTimeline scenes={demo.scenes.scenes} activeIndex={demo.activeIndex} />
          <div className="space-y-6">
            <StorytellingPanel scene={demo.activeScene} />
            <ScreenplayCaptions captions={demo.scenes.screenplay} activeIndex={demo.activeIndex} />
            <PremiumCard title="Scenario injector" eyebrow="Demo data injection" accent="amber">
              <div className="flex flex-wrap gap-3">
                {SCENARIOS.map((scenario) => (
                  <button className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-semibold capitalize text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-45" disabled={demo.busyAction === `inject-${scenario}`} key={scenario} onClick={() => demo.runScenario(scenario)} type="button">
                    {scenario.replace("multiincident", "multi-incident")}
                  </button>
                ))}
              </div>
            </PremiumCard>
          </div>
        </div>
        <DemoControls
          playing={demo.playing}
          speed={demo.speed}
          busyAction={demo.busyAction}
          onPlay={demo.play}
          onPause={demo.pause}
          onNext={demo.next}
          onPrevious={demo.previous}
          onSkip={demo.skipToClimax}
          onSpeed={demo.setSpeed}
          onFullscreen={demo.toggleFullscreen}
          onRun={demo.run}
          onReset={demo.reset}
        />
      </LaunchShell>
    </ProtectedWorkspaceShell>
  );
}
