import type { OpsResolutionEvent } from "@/lib/ops/types";

type BroadcastFeedProps = {
  feed: OpsResolutionEvent[];
};

export function BroadcastFeed({ feed }: BroadcastFeedProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">Incident Broadcast Feed</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Live communications timeline</h2>
      <div className="mt-5 grid gap-3">
        {feed.map((item) => (
          <article key={`${item.timestamp}-${item.event}`} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-white">{item.event}</h3>
              <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-300">{item.status}</span>
            </div>
            <p className="mt-2 text-sm text-slate-300">{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
