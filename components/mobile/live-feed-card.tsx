"use client";

import { memo } from "react";

import { cn, formatLastSync } from "@/lib/mobile/helpers";
import type { OpsFeedItem } from "@/lib/mobile/types";
import { GlassCard } from "./glass-card";

type LiveFeedCardProps = {
  feed: OpsFeedItem[];
  onTick?: () => void;
};

export const LiveFeedCard = memo(function LiveFeedCard({ feed, onTick }: LiveFeedCardProps) {
  return (
    <GlassCard>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100/60">Live operations</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.05em] text-white">Coordination feed</h2>
        </div>
        {onTick ? (
          <button className="min-h-10 rounded-full border border-white/10 bg-white/[0.06] px-3 text-xs font-bold text-slate-100" onClick={onTick} type="button">
            Sync
          </button>
        ) : null}
      </div>
      <div className="mt-4 space-y-3">
        {feed.slice(0, 6).map((item) => (
          <article className="rounded-3xl border border-white/10 bg-black/18 p-4" key={item.id}>
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className={cn(
                  "mt-1 h-2.5 w-2.5 rounded-full",
                  item.priority === "critical" && "bg-red-300 shadow-[0_0_16px_rgba(239,68,68,0.7)]",
                  item.priority === "high" && "bg-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.7)]",
                  item.priority === "normal" && "bg-blue-300 shadow-[0_0_16px_rgba(59,130,246,0.7)]",
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">{item.message}</p>
              </div>
              <time className="text-xs text-slate-500">{formatLastSync(item.createdAt)}</time>
            </div>
          </article>
        ))}
      </div>
    </GlassCard>
  );
});
