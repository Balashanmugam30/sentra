import type { DevelopersSummary } from "@/lib/developers/types";

export function DeveloperPlatformPanel({ summary, busyAction, onCreateKey }: { summary: DevelopersSummary; busyAction: string | null; onCreateKey: () => void }) {
  const metrics = [
    { label: "Developer score", value: summary.developer_ecosystem_score },
    { label: "Active developers", value: summary.active_developers },
    { label: "Apps created", value: summary.apps_created },
    { label: "SDK downloads", value: summary.sdk_downloads.toLocaleString() },
  ];

  return (
    <section className="rounded-[32px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-2xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/60">Public API Platform</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">Docs, keys, webhooks, SDKs, sandbox</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">Tenant-scoped API keys, rate limits, usage analytics, webhook subscriptions, and sandbox events make Sentra builder-ready.</p>
        </div>
        <button className="rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60" disabled={busyAction !== null} onClick={onCreateKey} type="button">
          Create sandbox key
        </button>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {metrics.map((metric) => (
          <div className="rounded-3xl border border-white/10 bg-black/25 p-5" key={metric.label}>
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">{metric.label}</p>
            <p className="mt-3 font-mono text-3xl text-white">{metric.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {summary.environments.map((environment) => (
          <div className="rounded-2xl border border-cyan-200/10 bg-cyan-200/[0.05] p-4" key={environment.environment_id}>
            <p className="font-semibold text-white">{environment.name}</p>
            <p className="mt-2 text-sm text-white/55">{environment.mode} | {environment.keys} keys | {environment.events_today.toLocaleString()} events</p>
          </div>
        ))}
      </div>
    </section>
  );
}
