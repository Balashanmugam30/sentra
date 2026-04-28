import type { TwinReplayIntelligence } from "@/lib/twin/types";

export function ReplayIntelligence({ replay }: { replay: TwinReplayIntelligence }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-purple-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-200/70">Premium Replay Intelligence</p>
      <h2 className="mt-2 text-2xl font-black text-white">Lessons Learned</h2>
      <div className="mt-5 space-y-3">
        {replay.lessons.map((lesson) => (
          <article key={lesson.lesson_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-black text-white">{lesson.mistake}</h3>
                <p className="mt-2 text-sm leading-6 text-purple-100/80">{lesson.better_alternative}</p>
              </div>
              <p className="text-2xl font-black text-purple-100">{lesson.confidence}%</p>
            </div>
            <p className="mt-3 rounded-2xl border border-purple-300/15 bg-purple-300/10 p-3 text-sm text-purple-50">{lesson.audit_evidence}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

