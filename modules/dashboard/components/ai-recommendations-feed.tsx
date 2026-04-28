"use client";

import { useAutonomousAI } from "@/lib/ai/use-autonomous-ai";
import { useLiveDataStore } from "@/lib/realtime/live-data-store";

export function AIRecommendationsFeed() {
  const { approve, busyAction, live, recommendations, reject } = useAutonomousAI();
  const liveRecommendations = useLiveDataStore((state) => state.aiRecommendations);
  const approveLive = useLiveDataStore((state) => state.approveRecommendation);
  const rejectLive = useLiveDataStore((state) => state.rejectRecommendation);
  const fallbackActions = recommendations?.recommendations ?? live?.recommended_actions ?? [];
  const actions = liveRecommendations.length
    ? liveRecommendations.map((action) => ({
        approval_required: action.state === "pending",
        confidence: action.confidence,
        expected_impact: action.impact,
        recommendation_id: action.id,
        title: action.action,
        urgency: Math.round(action.urgency),
        why: action.reason,
        zone: action.zone,
      }))
    : fallbackActions;

  return (
    <section className="sentra-ai-recommendations-feed rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.74)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="sentra-ui-label text-xs font-semibold uppercase tracking-[0.24em] text-white/48">
            AI Recommendations Feed
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-white">
            Decisions ready for approval
          </h2>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {actions.map((action) => (
          <article
            className="sentra-ai-recommendation-card rounded-[24px] border border-white/10 bg-white/[0.045] p-4"
            key={action.recommendation_id}
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-white">{action.title}</h3>
                  <span className="sentra-decision-chip rounded-full border border-white/12 bg-white/[0.055] px-3 py-1 text-[0.65rem] uppercase tracking-[0.16em] text-white/68">
                    {action.zone ?? "global"}
                  </span>
                  <span className="sentra-decision-chip rounded-full border border-white/12 bg-white/[0.055] px-3 py-1 text-[0.65rem] uppercase tracking-[0.16em] text-white/68">
                    {action.approval_required ? "approval" : "one-click"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-white/62">{action.why}</p>
                <p className="mt-2 text-sm text-white/48">{action.expected_impact}</p>
              </div>
              <div className="grid min-w-[220px] gap-2 text-sm text-white/72">
                <div>Urgency {action.urgency}%</div>
                <div>Confidence {action.confidence}%</div>
                <div className="flex gap-2 pt-2">
                  <button
                    className="sentra-decision-button is-approve rounded-full border border-white/16 bg-white/[0.085] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                    disabled={busyAction !== null}
                    onClick={() => {
                      if (liveRecommendations.length) {
                        approveLive(action.recommendation_id);
                      } else {
                        void approve(action.recommendation_id);
                      }
                    }}
                    type="button"
                  >
                    {busyAction === `approve-${action.recommendation_id}` ? "Approving" : "Approve"}
                  </button>
                  <button
                    className="sentra-decision-button is-reject rounded-full border border-white/12 bg-black/20 px-3 py-2 text-xs font-semibold text-white/72 disabled:opacity-50"
                    disabled={busyAction !== null}
                    onClick={() => {
                      if (liveRecommendations.length) {
                        rejectLive(action.recommendation_id);
                      } else {
                        void reject(action.recommendation_id);
                      }
                    }}
                    type="button"
                  >
                    {busyAction === `reject-${action.recommendation_id}` ? "Rejecting" : "Reject"}
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
        {!actions.length ? (
          <div className="rounded-[22px] border border-white/10 bg-white/5 p-4 text-sm text-white/60">
            Syncing ranked recommendations from the autonomous core.
          </div>
        ) : null}
      </div>
    </section>
  );
}
