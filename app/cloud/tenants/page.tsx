"use client";

import type { Route } from "next";
import Link from "next/link";

import { TenantGrid } from "@/components/master/tenant-grid";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useMaster } from "@/lib/master/use-master";

export default function CloudTenantsPage() {
  const { cloud, loading, error, busyAction, lastAction, refresh, createTenant, switchTenant } = useMaster();

  return (
    <ProtectedWorkspaceShell>
      <main className="px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-blue-950/30 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-blue-200/70">Global Tenant Cloud</p>
                <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Multi-Tenant Command Cloud</h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">Tenant isolation, role hierarchy, usage quotas, SLA views, org switching, and global command capacity for enterprise rollout.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => refresh()} className="rounded-2xl border border-blue-300/30 bg-blue-300/10 px-5 py-3 text-sm font-semibold text-blue-50 transition hover:bg-blue-300/20">
                  {loading ? "Syncing..." : "Refresh cloud"}
                </button>
                <Link href={"/cloud/global" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Global map
                </Link>
                <Link href={"/cloud/admin" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Admin
                </Link>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-5">
              {[
                ["Tenants", cloud.tenants_active.toString()],
                ["Regions", cloud.regions_online.toString()],
                ["Buildings", cloud.buildings_managed.toLocaleString()],
                ["Users", cloud.users_managed.toLocaleString()],
                ["Avg SLA", `${cloud.average_sla_percent}%`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </header>
          {error ? <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">{error}</div> : null}
          {lastAction ? <div className="mt-4 rounded-2xl border border-blue-300/20 bg-blue-400/10 p-4 text-sm text-blue-100">{lastAction}</div> : null}
          <div className="mt-6">
            <TenantGrid tenants={cloud.tenants} usage={cloud.usage} busyAction={busyAction} onCreate={createTenant} onSwitch={switchTenant} />
          </div>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}
