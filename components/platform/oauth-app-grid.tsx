"use client";

import { platformStatusTone } from "@/lib/platform/runtime";
import type { PlatformOAuthApp } from "@/lib/platform/types";

type OAuthAppGridProps = {
  apps: PlatformOAuthApp[];
  busyAction: string | null;
  onCreate: () => void;
  onUpdate: (appId: string) => void;
  onRevoke: (appId: string) => void;
};

export function OAuthAppGrid({ apps, busyAction, onCreate, onUpdate, onRevoke }: OAuthAppGridProps) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">OAuth Apps</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">External app approvals</h3>
        </div>
        <button className="rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60" disabled={busyAction !== null} onClick={onCreate} type="button">
          Create app
        </button>
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        {apps.map((app) => (
          <article className="rounded-[26px] border border-white/10 bg-black/20 p-5" key={app.app_id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-lg font-semibold text-white">{app.name}</h4>
                <p className="mt-1 font-mono text-xs text-white/40">{app.client_id}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs ${platformStatusTone(app.status)}`}>{app.status}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {app.scopes.map((scope) => (
                <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-white/55" key={scope}>{scope}</span>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Metric label="Users" value={`${app.connected_users}`} />
              <Metric label="Env" value={app.environment} />
            </div>
            <div className="mt-5 flex gap-2">
              <button className="flex-1 rounded-xl border border-cyan-200/20 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/10 disabled:opacity-50" disabled={busyAction !== null || app.status === "revoked"} onClick={() => onUpdate(app.app_id)} type="button">
                Scope review
              </button>
              <button className="flex-1 rounded-xl border border-rose-200/20 px-3 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-300/10 disabled:opacity-50" disabled={busyAction !== null || app.status === "revoked"} onClick={() => onRevoke(app.app_id)} type="button">
                Revoke
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">{label}</p>
      <p className="mt-1 font-mono text-sm text-white">{value}</p>
    </div>
  );
}

