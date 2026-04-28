"use client";

import { useState } from "react";

type ExecutiveSummaryProps = {
  summary: string;
  generatedAt: string;
};

export function ExecutiveSummary({ summary, generatedAt }: ExecutiveSummaryProps) {
  const [copied, setCopied] = useState(false);

  const copySummary = async () => {
    if (!navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(summary);
    setCopied(true);
  };

  return (
    <section className="rounded-[2rem] border border-amber-200/20 bg-gradient-to-br from-amber-300/10 via-slate-950/80 to-cyan-300/10 p-5 shadow-2xl shadow-amber-950/20 backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-100/70">Executive Summary</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Board-ready incident brief</h2>
        </div>
        <button
          type="button"
          onClick={copySummary}
          className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <p className="mt-5 text-base leading-7 text-slate-100">{summary}</p>
      <p className="mt-4 text-xs uppercase tracking-[0.24em] text-slate-500">
        Generated {new Date(generatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </p>
    </section>
  );
}
