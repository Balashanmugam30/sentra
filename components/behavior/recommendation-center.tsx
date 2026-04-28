import type { BehaviorRecommendation } from "@/lib/behavior/types";

type RecommendationCenterProps = {
  recommendations: BehaviorRecommendation[];
};

export function RecommendationCenter({ recommendations }: RecommendationCenterProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Communication recommendations</p>
      <div className="mt-4 grid gap-3">
        {recommendations.map((recommendation) => (
          <article key={recommendation.recommendation_id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{recommendation.zone}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-cyan-100">{recommendation.priority}</p>
              </div>
              <p className="text-xl font-black text-white">{recommendation.confidence}%</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-200">{recommendation.message_style}</p>
            <p className="mt-2 text-sm leading-6 text-emerald-100">{recommendation.action}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

