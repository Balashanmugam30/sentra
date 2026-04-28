"use client";

import type { UseOsintResult } from "@/lib/osint/use-osint";

type NewsFeedPanelProps = {
  osint: UseOsintResult;
};

export function NewsFeedPanel({ osint }: NewsFeedPanelProps) {
  const items = osint.news?.items ?? [];

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.78)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-200/70">
            News Feed Panel
          </p>
          <h2 className="text-lg font-semibold text-white">
            Relevant public headlines and regional coverage affecting operations and reputation
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((item, index) => (
            <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4" key={`${item.headline}-${item.source}-${item.published_at}-${index}`}>
              <div className="text-[0.68rem] uppercase tracking-[0.16em] text-cyan-200/60">
                {item.source} • {item.severity}
              </div>
              <div className="mt-2 text-sm font-medium text-white">{item.headline}</div>
              <div className="mt-2 text-sm text-white/70">{item.summary}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
