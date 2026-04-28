"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";

import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { apiClient } from "@/lib/core/api-client";

type CloudScale = {
  tenant_count: number;
  region_count: number;
  storage_usage_tb: number;
  compute_usage: {
    ai_runs_today: number;
    notifications_today: number;
    command_capacity: number;
    queue_backpressure: number;
    fallback_cache_hit_rate: number;
  };
  noisy_tenants: { tenant_name: string; ai_runs: number; notifications: number; quota_health: number }[];
  enterprise_sla_heatmap: { region: string; sla_percent: number; latency_ms: number; capacity: number; state: string }[];
  premium_support_queue: { tenant: string; priority: string; reason: string; eta_minutes: number }[];
  hardening: { circuit_breakers: string; idempotency: string; bulkheads: string; error_budget_remaining_percent: number; slo_target: string };
};

const fallbackScale: CloudScale = {
  tenant_count: 5,
  region_count: 4,
  storage_usage_tb: 18.6,
  compute_usage: { ai_runs_today: 28420, notifications_today: 184000, command_capacity: 91, queue_backpressure: 27, fallback_cache_hit_rate: 91 },
  noisy_tenants: [
    { tenant_name: "SmartCity Authority", ai_runs: 9200, notifications: 74000, quota_health: 74 },
    { tenant_name: "Grand Meridian Hotels", ai_runs: 6100, notifications: 52000, quota_health: 82 },
  ],
  enterprise_sla_heatmap: [
    { region: "APAC", sla_percent: 99, latency_ms: 88, capacity: 86, state: "healthy" },
    { region: "Middle East", sla_percent: 98, latency_ms: 104, capacity: 82, state: "healthy" },
    { region: "North America", sla_percent: 97, latency_ms: 121, capacity: 79, state: "healthy" },
  ],
  premium_support_queue: [
    { tenant: "MetroCare Hospitals", priority: "P1", reason: "SLA review before oxygen-system pilot", eta_minutes: 9 },
    { tenant: "SmartCity Authority", priority: "P2", reason: "Quota expansion for city drill", eta_minutes: 18 },
  ],
  hardening: { circuit_breakers: "enabled", idempotency: "enforced on mutation endpoints", bulkheads: "tenant queues isolated", error_budget_remaining_percent: 93, slo_target: "99.95%" },
};

export default function CloudScalePage() {
  const [scale, setScale] = useState(fallbackScale);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.requestData<{ data: CloudScale }>("/cloud/scale", { priority: "critical", cacheTtlMs: 12_000 });
      setScale(response.data);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Cloud scale command is running in fallback mode");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <ProtectedWorkspaceShell>
      <main className="px-5 py-8 text-white md:px-8">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(99,102,241,0.18),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(34,211,238,0.12),transparent_32%),linear-gradient(180deg,#02040a_0%,#030712_100%)]" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6">
          <header className="rounded-[34px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-100/65">Multi-Tenant Scale Command</p>
                <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.045em] text-white md:text-6xl">Operate Sentra at global enterprise scale</h1>
                <p className="mt-4 max-w-3xl text-sm leading-6 text-white/55">Tenant counts, region health, quotas, noisy tenants, storage, compute, SLA heatmaps, premium support, and production hardening posture.</p>
              </div>
              <button className="rounded-2xl bg-indigo-100 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60" disabled={loading} onClick={() => void refresh()} type="button">
                {loading ? "Refreshing" : "Refresh scale"}
              </button>
            </div>
            {error && <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/60">Resilient mode: {error}</div>}
          </header>
          <section className="grid gap-4 md:grid-cols-5">
            <Kpi label="Tenants" value={scale.tenant_count} />
            <Kpi label="Regions" value={scale.region_count} />
            <Kpi label="Storage TB" value={scale.storage_usage_tb} />
            <Kpi label="Queue Pressure" value={`${scale.compute_usage.queue_backpressure}%`} />
            <Kpi label="Error Budget" value={`${scale.hardening.error_budget_remaining_percent}%`} />
          </section>
          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Panel title="Enterprise SLA heatmap">
              {scale.enterprise_sla_heatmap.map((region) => (
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4" key={region.region}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-white">{region.region}</p>
                    <span className="rounded-full border border-emerald-200/20 bg-emerald-200/10 px-3 py-1 text-xs text-emerald-100">{region.state}</span>
                  </div>
                  <p className="mt-2 text-sm text-white/55">{region.sla_percent}% SLA | {region.latency_ms}ms | {region.capacity}% capacity</p>
                </div>
              ))}
            </Panel>
            <Panel title="Noisy tenants and support queue">
              {scale.noisy_tenants.map((tenant) => (
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4" key={tenant.tenant_name}>
                  <p className="font-semibold text-white">{tenant.tenant_name}</p>
                  <p className="mt-2 text-sm text-white/55">{tenant.ai_runs.toLocaleString()} AI runs | {tenant.notifications.toLocaleString()} notifications | quota {tenant.quota_health}%</p>
                </div>
              ))}
              {scale.premium_support_queue.map((item) => (
                <div className="rounded-2xl border border-amber-200/15 bg-amber-200/[0.06] p-4" key={`${item.tenant}-${item.priority}`}>
                  <p className="font-semibold text-amber-50">{item.priority} | {item.tenant}</p>
                  <p className="mt-2 text-sm text-amber-100/65">{item.reason} | ETA {item.eta_minutes}m</p>
                </div>
              ))}
            </Panel>
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

function Kpi({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">{label}</p>
      <p className="mt-3 font-mono text-3xl text-white">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl">
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <div className="mt-5 space-y-3">{children}</div>
    </section>
  );
}
