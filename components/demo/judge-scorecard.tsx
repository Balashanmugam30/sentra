"use client";

import type { DemoJudgeState } from "@/lib/demo/types";

export function JudgeScorecard({ judge }: { judge: DemoJudgeState }) {
  return (
    <section className="rounded-[36px] border border-white/10 bg-white/[0.055] p-6 shadow-[0_24px_100px_rgba(0,0,0,0.35)]">
      <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/60">Judge scoring mode</p>
          <p className="mt-5 font-mono text-8xl text-emerald-200">{judge.overall_score}</p>
          <p className="mt-3 text-sm leading-6 text-white/55">{judge.judge_summary}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {judge.scores.map((score) => (
            <article className="rounded-3xl border border-white/10 bg-black/25 p-4" key={score.category}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">{score.category}</h3>
                <span className="font-mono text-2xl text-emerald-200">{score.score}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/50">{score.reason}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

