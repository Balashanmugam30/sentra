import { trainingScore } from "@/lib/ml/training";
import type { MLJob } from "@/lib/ml/types";

type TrainingQueueProps = {
  jobs: MLJob[];
};

export function TrainingQueue({ jobs }: TrainingQueueProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Training queue</p>
      <div className="mt-5 space-y-3">
        {jobs.map((job) => (
          <article key={job.job_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-black text-white">{job.model_domain}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{job.algorithm} - {job.status}</p>
              </div>
              <p className="text-2xl font-black text-cyan-100">{trainingScore(job)}</p>
            </div>
            <div className="mt-3 grid gap-2 text-xs text-slate-300 sm:grid-cols-5">
              <span>Acc {job.accuracy}%</span>
              <span>F1 {job.f1}%</span>
              <span>Time {job.training_time_minutes}m</span>
              <span>GPU {job.gpu_usage}%</span>
              <span>{job.owner}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
