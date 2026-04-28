import type { OpsRetryProvider } from "@/lib/ops/types";

type RetryHealthProps = {
  providers: OpsRetryProvider[];
};

export function RetryHealth({ providers }: RetryHealthProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-100/70">Retry + Self-Heal</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Provider failover health</h2>
      <div className="mt-5 grid gap-3">
        {providers.map((provider) => (
          <article key={provider.provider} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{provider.provider}</h3>
                <p className="mt-1 text-xs text-slate-500">P95 {provider.p95_latency} - queued {provider.queued}</p>
              </div>
              <span className={provider.status === "healthy" ? "text-emerald-100" : "text-amber-100"}>{provider.status}</span>
            </div>
            <p className="mt-3 text-sm text-slate-300">
              Failed {provider.failed}. Failover {provider.failover_ready ? "armed" : "not ready"}.
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
