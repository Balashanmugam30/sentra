import { datasetReadiness } from "@/lib/ml/training";
import type { MLDataset } from "@/lib/ml/types";

type DatasetTableProps = {
  datasets: MLDataset[];
};

export function DatasetTable({ datasets }: DatasetTableProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Active datasets</p>
      <div className="mt-5 space-y-3">
        {datasets.map((dataset) => (
          <article key={dataset.dataset_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-black text-white">{dataset.name}</p>
                <p className="mt-1 text-sm text-slate-400">{dataset.source} - {dataset.domain}</p>
              </div>
              <span className="rounded-2xl bg-cyan-400/10 px-3 py-1 text-sm font-black text-cyan-100">{datasetReadiness(dataset)} ready</span>
            </div>
            <div className="mt-3 grid gap-2 text-xs text-slate-300 sm:grid-cols-5">
              <span>{dataset.rows.toLocaleString()} rows</span>
              <span>{dataset.columns} columns</span>
              <span>{dataset.missing_percent}% missing</span>
              <span>{dataset.label_coverage}% labels</span>
              <span>{dataset.freshness_minutes}m fresh</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
