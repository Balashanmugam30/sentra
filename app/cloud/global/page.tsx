"use client";

import type { Route } from "next";
import Link from "next/link";

import { GlobalMap } from "@/components/master/global-map";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { useMaster } from "@/lib/master/use-master";

export default function CloudGlobalPage() {
  const { cloud, loading, refresh } = useMaster();

  return (
    <ProtectedWorkspaceShell>
      <main className="px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-indigo-950/30 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-indigo-200/70">Global Command Mode</p>
                <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Regional Command Cloud</h1>
                <p className="mt-4 max-w-3xl text-slate-300">Region routing, SLA health, global incidents, command nodes, and capacity controls for multi-tenant autonomous operations.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => refresh()} className="rounded-2xl border border-indigo-300/30 bg-indigo-300/10 px-5 py-3 text-sm font-semibold text-indigo-50 transition hover:bg-indigo-300/20">
                  {loading ? "Syncing..." : "Refresh regions"}
                </button>
                <Link href={"/cloud/tenants" as Route} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                  Tenants
                </Link>
              </div>
            </div>
          </header>
          <div className="mt-6">
            <GlobalMap regions={cloud.regions} incidents={cloud.global_incidents} />
          </div>
        </div>
      </main>
    </ProtectedWorkspaceShell>
  );
}

