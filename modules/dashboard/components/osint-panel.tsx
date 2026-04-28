"use client";

import type { UseOsintResult } from "@/lib/osint/use-osint";

type OsintPanelProps = {
  osint: UseOsintResult;
  canManageOsint: boolean;
};

export function OsintPanel({ osint, canManageOsint }: OsintPanelProps) {
  const { busyAction, error, lastUpdated, live, loading, refresh, runScenario, status } = osint;

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.78)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-200/70">
              Open Intelligence Center
            </p>
            <h2 className="text-lg font-semibold text-white">
              External awareness for headlines, sentiment, rumor pressure, and public narrative risk
            </h2>
          </div>
          <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs uppercase tracking-[0.16em] text-cyan-100">
            {loading ? "Syncing OSINT" : `${status} • ${live?.provider ?? "demo"} provider`}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-6">
          {[
            ["Threat Level", live?.threat_level ?? "--"],
            ["Reputation Risk", String(live?.reputation_risk ?? 0)],
            ["Mention Volume", String(live?.mention_volume ?? 0)],
            ["Negative Sentiment", `${live?.sentiment_summary?.negative ?? 0}%`],
            ["Top Keyword", live?.top_keywords?.[0] ?? "--"],
            ["Provider", live?.provider ?? "--"],
          ].map(([label, value], index) => (
            <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4" key={`${label}-${index}`}>
              <div className="text-[0.68rem] uppercase tracking-[0.16em] text-cyan-200/60">{label}</div>
              <div className="mt-2 text-sm font-medium text-white">{value}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {canManageOsint ? (
            <>
              <button
                className="rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm font-medium text-rose-100 disabled:opacity-50"
                disabled={busyAction !== null}
                onClick={() => {
                  void runScenario("viral_fire_video");
                }}
                type="button"
              >
                {busyAction === "scenario-viral_fire_video" ? "Running..." : "Run Viral Fire Video"}
              </button>
              <button
                className="rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-100 disabled:opacity-50"
                disabled={busyAction !== null}
                onClick={() => {
                  void runScenario("fake_lockdown_rumor");
                }}
                type="button"
              >
                {busyAction === "scenario-fake_lockdown_rumor" ? "Running..." : "Run Fake Rumor"}
              </button>
            </>
          ) : null}
          <button
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            disabled={busyAction !== null}
            onClick={() => {
              void refresh();
            }}
            type="button"
          >
            Refresh
          </button>
        </div>

        {live?.top_keywords?.length ? (
          <div className="flex flex-wrap gap-2">
            {live.top_keywords.map((keyword, index) => (
              <span
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.14em] text-slate-100"
                key={`${keyword}-${index}`}
              >
                {keyword}
              </span>
            ))}
          </div>
        ) : null}

        {lastUpdated ? (
          <p className="text-xs uppercase tracking-[0.14em] text-white/40">
            Last good sync {new Date(lastUpdated).toLocaleTimeString()}
          </p>
        ) : null}
        {error ? (
          <div className="rounded-[20px] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {status === "stale" ? "Showing last known external intelligence while reconnecting. " : ""}
            {error}
          </div>
        ) : null}
      </div>
    </section>
  );
}
