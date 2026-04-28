import { getHealthTone } from "@/lib/ops/resilience";
import type { OpsApiFailure, OpsCircuitBreaker, OpsQueuePressure, OpsSystemHealthRecord } from "@/lib/ops/types";

type SystemHealthGridProps = {
  health: OpsSystemHealthRecord[];
  failures: OpsApiFailure[];
  queues: OpsQueuePressure[];
  breakers: OpsCircuitBreaker[];
};

export function SystemHealthGrid({ health, failures, queues, breakers }: SystemHealthGridProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">System Health Grid</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Infrastructure under crisis load</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {health.map((record) => (
          <article key={record.module} className={`rounded-3xl border p-4 ${getHealthTone(record)}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{record.module}</h3>
                <p className="mt-1 text-xs opacity-75">{record.owner} - {record.latency_ms}ms</p>
              </div>
              <span className="text-2xl font-black text-white">{record.score}</span>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-5 grid gap-3 xl:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
          <h3 className="font-semibold text-white">API Failures</h3>
          {failures.map((failure) => (
            <p key={failure.route} className="mt-2 text-sm text-slate-300">{failure.route}: {failure.failures} - {failure.status}</p>
          ))}
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
          <h3 className="font-semibold text-white">Queue Pressure</h3>
          {queues.map((queue) => (
            <p key={queue.queue} className="mt-2 text-sm text-slate-300">{queue.queue}: {queue.depth} / {queue.pressure}%</p>
          ))}
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
          <h3 className="font-semibold text-white">Circuit Breakers</h3>
          {breakers.map((breaker) => (
            <p key={breaker.breaker} className="mt-2 text-sm text-slate-300">{breaker.breaker}: {breaker.state}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
