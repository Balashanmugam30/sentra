import type { MLDataset } from "@/lib/ml/types";

type DataQualityProps = {
  datasets: MLDataset[];
};

export function DataQuality({ datasets }: DataQualityProps) {
  const quality = Math.round(datasets.reduce((sum, dataset) => sum + dataset.quality_score, 0) / Math.max(datasets.length, 1));
  const labels = Math.round(datasets.reduce((sum, dataset) => sum + dataset.label_coverage, 0) / Math.max(datasets.length, 1));
  const missing = (datasets.reduce((sum, dataset) => sum + dataset.missing_percent, 0) / Math.max(datasets.length, 1)).toFixed(1);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Data quality score</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          ["Quality", `${quality}%`],
          ["Labels", `${labels}%`],
          ["Missing", `${missing}%`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-black text-white">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
