"use client";

import { marketplaceStatusTone } from "@/lib/marketplace/runtime";
import type { MarketplaceApp } from "@/lib/marketplace/types";

type AppCardProps = {
  app: MarketplaceApp;
  busyAction: string | null;
  onInstall: (appId: string) => void;
  onTrial: (appId: string) => void;
};

export function AppCard({ app, busyAction, onInstall, onTrial }: AppCardProps) {
  return (
    <article className="group rounded-[28px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl transition hover:-translate-y-1 hover:border-cyan-200/30 hover:bg-white/[0.07]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-cyan-200/20 bg-cyan-300/10 font-mono text-sm text-cyan-100">
            {app.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{app.name}</h3>
            <p className="text-xs text-white/45">{app.vendor}</p>
          </div>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs ${marketplaceStatusTone(app.status)}`}>{app.status}</span>
      </div>
      <p className="mt-4 min-h-16 text-sm leading-6 text-white/55">{app.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {app.tags.slice(0, 3).map((tag) => (
          <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-white/55" key={tag}>{tag}</span>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <Metric label="Rating" value={`${app.rating}`} />
        <Metric label="MRR" value={`$${app.monthly_price}`} />
        <Metric label="Version" value={app.version} />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <button className="rounded-xl bg-cyan-100 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-white disabled:opacity-50" disabled={busyAction !== null} onClick={() => onInstall(app.app_id)} type="button">
          Install
        </button>
        <button className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/10 disabled:opacity-50" disabled={busyAction !== null || !app.trial_available} onClick={() => onTrial(app.app_id)} type="button">
          Start trial
        </button>
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-white/40">{label}</p>
      <p className="mt-1 font-mono text-sm text-white">{value}</p>
    </div>
  );
}

