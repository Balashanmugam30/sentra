"use client";

import { ConnectorGallery } from "@/components/integrations/connector-gallery";
import { IntegrationHealth } from "@/components/integrations/integration-health";
import { SyncLogPanel } from "@/components/integrations/sync-log-panel";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useIntegrationHub } from "@/lib/integrations/use-integrations";

export default function IntegrationsPage() {
  const { summary, logs, loading, error, busyAction, lastAction, refresh, connect, testConnector } = useIntegrationHub();

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[#02040a] px-5 py-8 text-white md:px-8">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.13),transparent_32%),linear-gradient(180deg,#02040a_0%,#030712_100%)]" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6">
          <header className="rounded-[34px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/65">Universal Integration Hub</p>
                <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.045em] text-white md:text-6xl">Plug Sentra into everything</h1>
                <p className="mt-4 max-w-3xl text-sm leading-6 text-white/55">Enterprise tools, security platforms, IoT systems, communication providers, webhooks, n8n flows, token posture, and sync health in one production-grade console.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10" href="/integrations/automations">Automations</a>
                <button className="rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60" disabled={loading} onClick={() => void refresh()} type="button">
                  {loading ? "Refreshing" : "Refresh"}
                </button>
              </div>
            </div>
            {(error || lastAction) && <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/60">{error ? `Resilient mode: ${error}` : lastAction}</div>}
          </header>
          <IntegrationHealth summary={summary} />
          <ConnectorGallery connectors={summary.connectors} busyAction={busyAction} onConnect={() => void connect()} onTest={(connectorId) => void testConnector(connectorId)} />
          <SyncLogPanel logs={logs} />
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}
