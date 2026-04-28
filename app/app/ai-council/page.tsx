"use client";

import { useMemo } from "react";

import { useLiveDataStore } from "@/lib/realtime/live-data-store";

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function stateLabel(state: string) {
  return state
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function AppAICouncilPage() {
  const incidents = useLiveDataStore((state) => state.incidents);
  const recommendations = useLiveDataStore((state) => state.aiRecommendations);
  const executive = useLiveDataStore((state) => state.executive);
  const approveRecommendation = useLiveDataStore((state) => state.approveRecommendation);
  const rejectRecommendation = useLiveDataStore((state) => state.rejectRecommendation);

  const activeIncidents = useMemo(
    () => incidents.filter((incident) => incident.status !== "resolved"),
    [incidents],
  );
  const avgConfidence = useMemo(() => {
    if (!recommendations.length) {
      return 93;
    }

    return Math.round(
      recommendations.reduce((sum, recommendation) => sum + recommendation.confidence, 0) /
        recommendations.length,
    );
  }, [recommendations]);
  const criticalDecisions = useMemo(
    () =>
      activeIncidents
        .slice()
        .sort((a, b) => b.severity - a.severity || b.spread_probability - a.spread_probability)
        .slice(0, 5),
    [activeIncidents],
  );

  return (
    <main className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-4 pb-12 pt-4 md:px-6 lg:px-8">
      <section className="sentra-app-card sentra-ai-council-hero p-7 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="sentra-ui-label">AI Council</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em] text-[var(--sentra-app-text)] md:text-5xl">
              Multi-agent decision core.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--sentra-app-muted)]">
              Ranked recommendations, risk decisions, confidence scoring, and human approval are
              gathered into one governed command surface.
            </p>
          </div>
          <div className="grid min-w-[min(100%,420px)] grid-cols-2 gap-3">
            {[
              ["Council confidence", formatPercent(avgConfidence)],
              ["Open actions", String(recommendations.filter((item) => item.state === "pending").length)],
              ["Active risks", String(activeIncidents.length)],
              ["Readiness", formatPercent(executive.readiness)],
            ].map(([label, value]) => (
              <div className="sentra-app-card rounded-3xl p-4" key={label}>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--sentra-app-soft)]">
                  {label}
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-[var(--sentra-app-text)]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.75fr)]">
        <div className="sentra-app-card p-6 md:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="sentra-ui-label">Recommendations feed</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-[var(--sentra-app-text)]">
                Suggested actions
              </h2>
            </div>
            <p className="text-sm text-[var(--sentra-app-muted)]">
              {recommendations.length} council outputs
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {recommendations.map((recommendation) => (
              <article className="sentra-app-card rounded-[24px] p-5" key={recommendation.id}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold tracking-[-0.025em] text-[var(--sentra-app-text)]">
                        {recommendation.action}
                      </h3>
                      <span className="sentra-decision-chip">{recommendation.zone}</span>
                      <span className="sentra-decision-chip">{stateLabel(recommendation.state)}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[var(--sentra-app-muted)]">
                      {recommendation.reason}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--sentra-app-muted)]">
                      {recommendation.impact}
                    </p>
                  </div>
                  <div className="grid min-w-[210px] gap-2 text-sm text-[var(--sentra-app-muted)]">
                    <div className="flex items-center justify-between gap-4">
                      <span>Urgency</span>
                      <strong className="text-[var(--sentra-app-text)]">
                        {formatPercent(recommendation.urgency)}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Confidence</span>
                      <strong className="text-[var(--sentra-app-text)]">
                        {formatPercent(recommendation.confidence)}
                      </strong>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button
                        className="sentra-council-action"
                        onClick={() => approveRecommendation(recommendation.id)}
                        type="button"
                      >
                        Approve
                      </button>
                      <button
                        className="sentra-council-action is-secondary"
                        onClick={() => rejectRecommendation(recommendation.id)}
                        type="button"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="flex flex-col gap-6">
          <section className="sentra-app-card p-6">
            <p className="sentra-ui-label">Risk decisions</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-[var(--sentra-app-text)]">
              Priority signals
            </h2>
            <div className="mt-5 space-y-3">
              {criticalDecisions.length ? (
                criticalDecisions.map((incident) => (
                  <article className="rounded-[22px] border border-[var(--sentra-app-border)] bg-[var(--sentra-app-panel-elevated)] p-4" key={incident.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-[var(--sentra-app-text)]">{incident.title}</h3>
                        <p className="mt-1 text-sm text-[var(--sentra-app-muted)]">{incident.location}</p>
                      </div>
                      <span className="sentra-decision-chip">S{incident.severity}</span>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-[var(--sentra-app-muted)]">
                      <span>{incident.lifecycle_status}</span>
                      <span>ETA {incident.eta_minutes}m</span>
                      <span>{formatPercent(incident.spread_probability)} spread</span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[22px] border border-[var(--sentra-app-border)] bg-[var(--sentra-app-panel-elevated)] p-5 text-sm text-[var(--sentra-app-muted)]">
                  Governance queue clear. No active incident requires council escalation.
                </div>
              )}
            </div>
          </section>

          <section className="sentra-app-card p-6">
            <p className="sentra-ui-label">Confidence scores</p>
            <div className="mt-4 space-y-4">
              {[
                ["Model agreement", avgConfidence],
                ["Operational readiness", executive.readiness],
                ["Threat containment", Math.max(0, 100 - executive.threatScore)],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--sentra-app-muted)]">{label}</span>
                    <span className="font-semibold text-[var(--sentra-app-text)]">{value}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--sentra-app-active)]">
                    <div
                      className="h-full rounded-full bg-[var(--sentra-app-text)]"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
