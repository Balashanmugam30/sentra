"use client";

import type { PrivacyQueueItem } from "@/lib/securitytrust/types";

export function RetentionBoard({ queues }: { queues: PrivacyQueueItem[] }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/70">Retention + Requests</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Privacy operations queue</h2>
      <div className="mt-5 grid gap-3">
        {queues.map((item) => (
          <article className="rounded-3xl border border-white/10 bg-black/20 p-4" key={item.queue_id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{item.subject}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/40">{item.type} / {item.status}</p>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-white/70">Due {item.due_days}d</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" style={{ width: `${Math.max(8, 100 - item.risk)}%` }} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
