import type { OpsFailureForecast, OpsIntegrationHealth, OpsLatencyRecord, OpsRetryEngineRecord, OpsWorkflowFailure } from "@/lib/ops/types";

type LatencyRadarProps = {
  latency: OpsLatencyRecord[];
  integrations: OpsIntegrationHealth[];
  retries: OpsRetryEngineRecord[];
  workflowFailures: OpsWorkflowFailure[];
  forecasts: OpsFailureForecast[];
};

export function LatencyRadar({ latency, integrations, retries, workflowFailures, forecasts }: LatencyRadarProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-blue-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-100/70">Latency Radar</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Failure prediction AI</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {latency.map((item) => (
          <article key={item.service} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-white">{item.service}</h3>
              <span className={item.p95 > 1000 ? "font-bold text-amber-100" : "font-bold text-cyan-100"}>{item.p95}ms</span>
            </div>
            <p className="mt-2 text-sm text-slate-300">P50 {item.p50}ms - P99 {item.p99}ms</p>
          </article>
        ))}
      </div>
      <div className="mt-5 grid gap-3">
        {forecasts.map((forecast) => (
          <article key={forecast.risk_id} className="rounded-3xl border border-amber-300/20 bg-amber-400/10 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{forecast.title}</h3>
                <p className="mt-2 text-sm text-amber-100/80">{forecast.driver}. {forecast.recommendation}</p>
              </div>
              <span className="text-2xl font-black text-amber-100">{forecast.risk_score}</span>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
          <h3 className="font-semibold text-white">Integrations</h3>
          {integrations.map((item) => <p key={item.integration} className="mt-2 text-sm text-slate-300">{item.integration}: {item.status}</p>)}
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
          <h3 className="font-semibold text-white">Retry Engine</h3>
          {retries.map((item) => <p key={item.provider} className="mt-2 text-sm text-slate-300">{item.provider}: {item.success_rate}%</p>)}
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
          <h3 className="font-semibold text-white">Workflow Failures</h3>
          {workflowFailures.map((item) => <p key={`${item.workflow_id}-${item.task}`} className="mt-2 text-sm text-slate-300">{item.task}: {item.recovery_action}</p>)}
        </div>
      </div>
    </section>
  );
}
