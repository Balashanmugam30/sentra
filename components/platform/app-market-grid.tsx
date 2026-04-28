"use client";

import { AppCard } from "@/components/platform/app-card";
import type { MarketplaceApp } from "@/lib/marketplace/types";

type AppMarketGridProps = {
  title: string;
  apps: MarketplaceApp[];
  busyAction: string | null;
  onInstall: (appId: string) => void;
  onTrial: (appId: string) => void;
};

export function AppMarketGrid({ title, apps, busyAction, onInstall, onTrial }: AppMarketGridProps) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">Catalog</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
      <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {apps.map((app) => (
          <AppCard app={app} busyAction={busyAction} key={app.app_id} onInstall={onInstall} onTrial={onTrial} />
        ))}
      </div>
    </section>
  );
}

