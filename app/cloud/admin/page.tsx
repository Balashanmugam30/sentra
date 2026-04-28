"use client";

import { TenantGrid } from "@/components/master/tenant-grid";
import { GlobalMap } from "@/components/master/global-map";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useMaster } from "@/lib/master/use-master";

export default function CloudAdminPage() {
  const { cloud, busyAction, createTenant, switchTenant } = useMaster();

  return (
    <ProtectedWorkspaceShell>
      <main className="px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-blue-950/30 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.36em] text-blue-200/70">Cloud Admin</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Global Admin Console</h1>
            <p className="mt-4 max-w-3xl text-slate-300">Cross-tenant analytics, org switching, SLA views, role hierarchy, audit posture, and command capacity in one guarded console.</p>
          </header>
          <section className="mt-6 grid gap-6">
            <TenantGrid tenants={cloud.tenants} usage={cloud.usage} busyAction={busyAction} onCreate={createTenant} onSwitch={switchTenant} />
            <GlobalMap regions={cloud.regions} incidents={cloud.global_incidents} />
          </section>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

