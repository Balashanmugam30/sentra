import type { IntegrationHubLogs } from "@/lib/integrations/types";

export function SyncLogPanel({ logs }: { logs: IntegrationHubLogs }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/40">Sync Logs</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Failed integrations and replay evidence</h3>
        </div>
        <span className="rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1 text-sm text-amber-100">{logs.retrying.length} retrying</span>
      </div>
      <div className="mt-5 space-y-3">
        {logs.logs.map((log) => (
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4" key={log.log_id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-sm text-white">{log.log_id}</p>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/55">{log.status}</span>
            </div>
            <p className="mt-2 text-sm text-white/60">{log.message}</p>
            <p className="mt-2 text-xs text-white/35">{log.connector_id} | {log.latency_ms}ms | {log.created_at}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
