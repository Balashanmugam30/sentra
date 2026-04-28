"use client";

import type { UseOsintResult } from "@/lib/osint/use-osint";

type SentimentRadarPanelProps = {
  osint: UseOsintResult;
};

export function SentimentRadarPanel({ osint }: SentimentRadarPanelProps) {
  const sentiment = osint.live?.sentiment_summary;
  const metrics = [
    ["Positive", sentiment?.positive ?? 0],
    ["Neutral", sentiment?.neutral ?? 0],
    ["Negative", sentiment?.negative ?? 0],
    ["Fear", sentiment?.fear ?? 0],
    ["Anger", sentiment?.anger ?? 0],
    ["Urgency", sentiment?.urgency ?? 0],
  ];

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.78)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-200/70">
            Sentiment Radar
          </p>
          <h2 className="text-lg font-semibold text-white">
            External narrative balance across confidence, concern, anger, and urgency
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {metrics.map(([label, value], index) => (
            <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4" key={`${label}-${index}`}>
              <div className="text-[0.68rem] uppercase tracking-[0.16em] text-cyan-200/60">{label}</div>
              <div className="mt-2 text-sm font-medium text-white">{value}%</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
