"use client";

import { AutomationExchange } from "@/components/integrations/automation-exchange";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useIntegrationHub } from "@/lib/integrations/use-integrations";

export default function IntegrationAutomationsPage() {
  const { summary, loading, error, lastAction, refresh } = useIntegrationHub();

  return (
    <ProtectedWorkspaceShell>
      <main className="min-h-screen overflow-hidden bg-[#02040a] px-5 py-8 text-white md:px-8">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_26%_0%,rgba(16,185,129,0.16),transparent_34%),radial-gradient(circle_at_86%_18%,rgba(34,211,238,0.12),transparent_32%),linear-gradient(180deg,#02040a_0%,#031016_100%)]" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6">
          <header className="rounded-[34px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100/65">Workflow Automation Exchange</p>
                <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.045em] text-white md:text-6xl">Cross-app flows for every crisis signal</h1>
                <p className="mt-4 max-w-3xl text-sm leading-6 text-white/55">n8n-ready trigger, condition, and action workflows for incidents, escalations, billing, customer success, partner onboarding, and executive reporting.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10" href="/integrations">Connectors</a>
                <button className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60" disabled={loading} onClick={() => void refresh()} type="button">
                  {loading ? "Refreshing" : "Refresh flows"}
                </button>
              </div>
            </div>
            {(error || lastAction) && <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/60">{error ? `Resilient mode: ${error}` : lastAction}</div>}
          </header>
          <AutomationExchange automations={summary.automations} />
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}
