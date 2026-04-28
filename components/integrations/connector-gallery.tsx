import type { IntegrationConnector } from "@/lib/integrations/types";

const statusTone: Record<string, string> = {
  connected: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  degraded: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  watch: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
};

export function ConnectorGallery({
  connectors,
  busyAction,
  onConnect,
  onTest,
}: {
  connectors: IntegrationConnector[];
  busyAction: string | null;
  onConnect: () => void;
  onTest: (connectorId: string) => void;
}) {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      {connectors.map((connector) => (
        <article className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/20 backdrop-blur" key={connector.connector_id}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">{connector.category}</p>
              <h3 className="mt-2 text-xl font-semibold text-white">{connector.name}</h3>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusTone[connector.status] ?? "border-white/10 bg-white/10 text-white/70"}`}>
              {connector.status}
            </span>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
            <Metric label="Health" value={`${connector.health}%`} />
            <Metric label="Latency" value={`${connector.latency_ms}ms`} />
            <Metric label="Mapped" value={connector.mapped_entities} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {connector.scopes.slice(0, 3).map((scope) => (
              <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs text-white/55" key={`${connector.connector_id}-${scope}`}>
                {scope}
              </span>
            ))}
          </div>
          <div className="mt-5 flex gap-3">
            <button className="rounded-2xl bg-cyan-100 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60" disabled={busyAction !== null} onClick={() => onTest(connector.connector_id)} type="button">
              Test
            </button>
            <button className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10 disabled:opacity-60" disabled={busyAction !== null} onClick={onConnect} type="button">
              Connect
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">{label}</p>
      <p className="mt-2 font-mono text-lg text-white">{value}</p>
    </div>
  );
}
