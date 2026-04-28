"use client";

import { platformStatusTone } from "@/lib/platform/runtime";
import type { PlatformApiKey } from "@/lib/platform/types";

type ApiKeyTableProps = {
  keys: PlatformApiKey[];
  busyAction: string | null;
  onRotate: (keyId: string) => void;
  onRevoke: (keyId: string) => void;
};

export function ApiKeyTable({ keys, busyAction, onRotate, onRevoke }: ApiKeyTableProps) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">API Key Engine</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Tenant-scoped secrets</h3>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/55">{keys.length} keys</span>
      </div>
      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
        <div className="grid grid-cols-[1.3fr_1fr_0.8fr_1fr_1fr] bg-white/[0.04] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
          <span>Name</span>
          <span>Masked Key</span>
          <span>Status</span>
          <span>Scopes</span>
          <span className="text-right">Actions</span>
        </div>
        {keys.map((key) => (
          <div className="grid grid-cols-[1.3fr_1fr_0.8fr_1fr_1fr] items-center gap-3 border-t border-white/10 px-4 py-4 text-sm" key={key.key_id}>
            <div>
              <p className="font-semibold text-white">{key.name}</p>
              <p className="mt-1 font-mono text-xs text-white/40">{key.environment} / {key.requests_today.toLocaleString()} req today</p>
            </div>
            <p className="font-mono text-xs text-cyan-100/80">{key.masked_key}</p>
            <span className={`w-fit rounded-full border px-3 py-1 text-xs ${platformStatusTone(key.status)}`}>{key.status}</span>
            <div className="flex flex-wrap gap-1">
              {key.scopes.slice(0, 3).map((scope) => (
                <span className="rounded-full bg-white/[0.06] px-2 py-1 text-[10px] text-white/55" key={scope}>{scope}</span>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button className="rounded-xl border border-cyan-200/20 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/10 disabled:opacity-50" disabled={busyAction !== null || key.status === "revoked"} onClick={() => onRotate(key.key_id)} type="button">
                Rotate
              </button>
              <button className="rounded-xl border border-rose-200/20 px-3 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-300/10 disabled:opacity-50" disabled={busyAction !== null || key.status === "revoked"} onClick={() => onRevoke(key.key_id)} type="button">
                Revoke
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

