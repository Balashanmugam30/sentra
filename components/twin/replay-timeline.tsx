import { secondsLabel } from "@/lib/twin/runtime";
import type { TwinReplayEvent } from "@/lib/twin/types";

export function ReplayTimeline({ events }: { events: TwinReplayEvent[] }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-purple-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-200/70">Replay Engine</p>
      <h2 className="mt-2 text-2xl font-black text-white">Event Feed Replay</h2>
      <div className="mt-5 space-y-3">
        {events.map((event) => (
          <article key={event.event_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start gap-4">
              <span className="rounded-2xl border border-purple-300/25 bg-purple-300/10 px-3 py-2 text-xs font-black text-purple-100">{secondsLabel(event.second)}</span>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-purple-200/60">{event.type.replaceAll("_", " ")}</p>
                <h3 className="mt-1 font-black text-white">{event.title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-400">{event.detail}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

