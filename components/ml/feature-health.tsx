import { featureHealth } from "@/lib/ml/training";
import type { MLFeature } from "@/lib/ml/types";

type FeatureHealthProps = {
  features: MLFeature[];
};

export function FeatureHealth({ features }: FeatureHealthProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Feature drift watch</p>
      <div className="mt-5 space-y-4">
        {features.map((feature) => (
          <div key={feature.feature_id}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-white">{feature.name}</span>
              <span className="text-cyan-100">{featureHealth(feature)} health</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-black/30">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-blue-400" style={{ width: `${featureHealth(feature)}%` }} />
            </div>
            <p className="mt-1 text-xs text-slate-500">{feature.domain} - drift {feature.drift_score} - {feature.freshness}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
