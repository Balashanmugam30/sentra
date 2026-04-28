"use client";

import { marketplaceStatusTone } from "@/lib/marketplace/runtime";
import type { MarketplaceInstallation } from "@/lib/marketplace/types";

type InstalledAppsProps = {
  installations: MarketplaceInstallation[];
  busyAction: string | null;
  onEnable: (appId: string) => void;
  onDisable: (appId: string) => void;
  onUninstall: (appId: string) => void;
  onTest: (appId: string) => void;
};

export function InstalledApps({ installations, busyAction, onEnable, onDisable, onUninstall, onTest }: InstalledAppsProps) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">Tenant Apps</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">Installed app management</h3>
      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
        <div className="grid grid-cols-[1.2fr_0.8fr_0.7fr_0.8fr_1.1fr] bg-white/[0.04] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
          <span>App</span>
          <span>Status</span>
          <span>Version</span>
          <span>Usage</span>
          <span className="text-right">Actions</span>
        </div>
        {installations.map((install) => (
          <div className="grid grid-cols-[1.2fr_0.8fr_0.7fr_0.8fr_1.1fr] items-center gap-3 border-t border-white/10 px-4 py-4 text-sm" key={install.installation_id}>
            <div>
              <p className="font-semibold text-white">{install.app_name}</p>
              <p className="mt-1 text-xs text-white/40">{install.category}</p>
            </div>
            <span className={`w-fit rounded-full border px-3 py-1 text-xs ${marketplaceStatusTone(install.status)}`}>{install.enabled ? install.status : "disabled"}</span>
            <p className="font-mono text-xs text-white/60">{install.version}</p>
            <p className="font-mono text-xs text-white/60">{install.usage_count}</p>
            <div className="flex justify-end gap-2">
              <button className="rounded-xl border border-cyan-200/20 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/10 disabled:opacity-50" disabled={busyAction !== null} onClick={() => onTest(install.app_id)} type="button">Test</button>
              <button className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/10 disabled:opacity-50" disabled={busyAction !== null} onClick={() => install.enabled ? onDisable(install.app_id) : onEnable(install.app_id)} type="button">
                {install.enabled ? "Disable" : "Enable"}
              </button>
              <button className="rounded-xl border border-rose-200/20 px-3 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-300/10 disabled:opacity-50" disabled={busyAction !== null} onClick={() => onUninstall(install.app_id)} type="button">Uninstall</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

