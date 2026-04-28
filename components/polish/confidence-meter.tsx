"use client";

import { polishTone } from "@/lib/polish/runtime";

export function ConfidenceMeter({ label, score }: { label: string; score: number }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-black/25 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">{label}</p>
        <span className={`font-mono text-2xl ${polishTone(score)}`}>{score}%</span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-white" style={{ width: `${Math.max(4, Math.min(100, score))}%` }} />
      </div>
    </div>
  );
}

