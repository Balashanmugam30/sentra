import { secondsLabel } from "@/lib/twin/runtime";
import type { TwinReplayState } from "@/lib/twin/types";

type EventScrubberProps = {
  replay: TwinReplayState;
  busyAction: string | null;
  onLoad: (replayId?: string) => void;
};

export function EventScrubber({ replay, busyAction, onLoad }: EventScrubberProps) {
  const duration = replay.scrubber.duration_seconds || replay.selected.duration_seconds || 1;
  const position = Math.min(100, Math.round((replay.scrubber.position_seconds / duration) * 100));

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-violet-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-200/70">Timeline Scrubber</p>
      <h2 className="mt-2 text-2xl font-black text-white">{replay.selected.title}</h2>
      <div className="mt-5 rounded-[2rem] border border-violet-300/20 bg-violet-300/10 p-5">
        <div className="flex items-center justify-between text-sm text-violet-100">
          <span>{secondsLabel(replay.scrubber.position_seconds)}</span>
          <span>{secondsLabel(duration)}</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-black/30">
          <div className="h-full rounded-full bg-violet-300 shadow-[0_0_24px_rgba(196,181,253,0.45)]" style={{ width: `${position}%` }} />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {["Rewind", replay.scrubber.state === "paused" ? "Play" : "Pause", "Load"].map((label) => (
            <button key={label} type="button" onClick={() => (label === "Load" ? onLoad(replay.selected.replay_id) : undefined)} className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-sm font-bold text-white transition hover:bg-white/15">
              {label === "Load" && busyAction === "load-replay" ? "Loading..." : label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 rounded-3xl border border-cyan-300/15 bg-cyan-300/10 p-4">
        <p className="text-sm font-bold text-cyan-50">Winner: {replay.comparison.winner}</p>
        <p className="mt-1 text-sm text-cyan-100/75">{replay.comparison.alternate_outcome}</p>
      </div>
    </section>
  );
}

