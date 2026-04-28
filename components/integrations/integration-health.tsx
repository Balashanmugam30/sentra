import type { IntegrationHubSummary } from "@/lib/integrations/types";

export function IntegrationHealth({ summary }: { summary: IntegrationHubSummary }) {
  const items = [
    { label: "Connected", value: summary.connected, accent: "text-emerald-200" },
    { label: "Watch / degraded", value: summary.degraded, accent: "text-amber-200" },
    { label: "Avg health", value: `${summary.avg_health}%`, accent: "text-cyan-200" },
    { label: "Avg latency", value: `${summary.avg_latency_ms}ms`, accent: "text-blue-200" },
  ];

  return (
    <section className="rounded-[32px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-2xl">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/60">Universal Integration Hub</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">Connectors, scopes, health, mappings</h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-white/50">
          Circuit breakers, fallback caches, retry queues, idempotency keys, token posture, and schema mappings are visible in one operating layer.
        </p>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {items.map((item) => (
          <div className="rounded-3xl border border-white/10 bg-black/25 p-5" key={item.label}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">{item.label}</p>
            <p className={`mt-3 font-mono text-3xl ${item.accent}`}>{item.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        <Reliability label="Circuit Breakers" value={summary.reliability.circuit_breakers} />
        <Reliability label="Fallback Caches" value={summary.reliability.fallback_caches} />
        <Reliability label="Retry Queues" value={summary.reliability.retry_queues} />
        <Reliability label="Idempotency Keys" value={summary.reliability.idempotency_keys_today.toLocaleString()} />
      </div>
    </section>
  );
}

function Reliability({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-cyan-200/10 bg-cyan-200/[0.05] p-4">
      <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-100/45">{label}</p>
      <p className="mt-2 font-mono text-xl text-cyan-50">{value}</p>
    </div>
  );
}
