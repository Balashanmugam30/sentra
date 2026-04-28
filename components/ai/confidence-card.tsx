"use client";

import type { AIDecisionConfidence } from "@/lib/ai/types";

type ConfidenceCardProps = {
  confidence: AIDecisionConfidence;
};

const confidenceRows = [
  { key: "data_quality_score", label: "Data quality" },
  { key: "sensor_confidence", label: "Sensor confidence" },
  { key: "camera_confidence", label: "Camera confidence" },
  { key: "recommendation_confidence", label: "Recommendation confidence" },
] as const;

function confidenceTone(value: number) {
  if (value >= 85) {
    return "from-emerald-400 to-cyan-300";
  }
  if (value >= 70) {
    return "from-amber-300 to-orange-300";
  }
  return "from-rose-400 to-red-500";
}

export function ConfidenceCard({ confidence }: ConfidenceCardProps) {
  const requiresReview =
    confidence.human_review_required ||
    confidence.recommendation_confidence < 80 ||
    confidence.missing_data_warnings.length > 0;

  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">Trust System</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Confidence and data quality</h2>
        </div>
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-right">
          <p className="text-2xl font-black text-cyan-100">{confidence.recommendation_confidence}%</p>
          <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-100/60">AI confidence</p>
        </div>
      </div>

      {requiresReview ? (
        <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-3 text-sm text-amber-100">
          Human review recommended before irreversible building-wide action.
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm text-emerald-100">
          Decision quality is strong enough for command approval workflow.
        </div>
      )}

      <div className="mt-5 space-y-4">
        {confidenceRows.map((row) => {
          const value = confidence[row.key];

          return (
            <div key={row.key}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-300">{row.label}</span>
                <span className="font-semibold text-white">{value}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${confidenceTone(value)} shadow-lg`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {confidence.missing_data_warnings.length > 0 ? (
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Missing signals</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {confidence.missing_data_warnings.map((item) => (
              <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                {item}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
