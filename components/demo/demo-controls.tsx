"use client";

import { EliteButton } from "@/components/polish/elite-button";

export function DemoControls({
  playing,
  speed,
  busyAction,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onSkip,
  onSpeed,
  onFullscreen,
  onRun,
  onReset,
}: {
  playing: boolean;
  speed: number;
  busyAction: string | null;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onSpeed: (speed: number) => void;
  onFullscreen: () => void;
  onRun: (scenario?: string) => void;
  onReset: () => void;
}) {
  return (
    <section className="sticky bottom-4 z-20 rounded-[28px] border border-white/10 bg-black/70 p-4 shadow-[0_22px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
      <div className="flex flex-wrap items-center gap-3">
        <EliteButton disabled={busyAction === "run-fire"} onClick={() => onRun("fire")}>Run fire</EliteButton>
        <EliteButton variant="ghost" onClick={playing ? onPause : onPlay}>{playing ? "Pause" : "Play"}</EliteButton>
        <EliteButton variant="ghost" onClick={onPrevious}>Previous</EliteButton>
        <EliteButton disabled={busyAction === "next-scene"} variant="ghost" onClick={onNext}>Next</EliteButton>
        <EliteButton variant="ghost" onClick={onSkip}>Skip climax</EliteButton>
        <EliteButton variant="ghost" onClick={onFullscreen}>Fullscreen</EliteButton>
        <EliteButton variant="danger" disabled={busyAction === "reset-demo"} onClick={onReset}>Reset</EliteButton>
        {[1, 2, 4].map((item) => (
          <button className={`rounded-2xl px-3 py-2 text-sm font-semibold transition ${speed === item ? "bg-cyan-100 text-slate-950" : "border border-white/10 bg-white/[0.05] text-white/55 hover:text-white"}`} key={item} onClick={() => onSpeed(item)} type="button">
            x{item}
          </button>
        ))}
      </div>
    </section>
  );
}

