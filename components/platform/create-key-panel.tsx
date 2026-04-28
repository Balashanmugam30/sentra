"use client";

import { useState } from "react";

type CreateKeyPanelProps = {
  scopeCatalog: string[];
  busyAction: string | null;
  onCreate: (name: string, environment: string, scopes: string[]) => void;
};

export function CreateKeyPanel({ scopeCatalog, busyAction, onCreate }: CreateKeyPanelProps) {
  const [name, setName] = useState("Sandbox partner key");
  const [environment, setEnvironment] = useState("sandbox");
  const [scope, setScope] = useState(scopeCatalog[0] ?? "incidents:read");

  return (
    <section className="rounded-[30px] border border-white/10 bg-gradient-to-br from-cyan-300/10 via-white/[0.045] to-emerald-300/10 p-5 backdrop-blur-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">Create Key</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">Issue a masked tenant API key</h3>
      <p className="mt-3 text-sm leading-6 text-white/55">Creates a deterministic demo key with explicit scopes, environment tagging, and audit evidence.</p>
      <div className="mt-5 grid gap-3">
        <label className="grid gap-2 text-sm text-white/70">
          Key name
          <input className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-cyan-200/50" onChange={(event) => setName(event.target.value)} value={name} />
        </label>
        <label className="grid gap-2 text-sm text-white/70">
          Environment
          <select className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-cyan-200/50" onChange={(event) => setEnvironment(event.target.value)} value={environment}>
            <option value="sandbox">Sandbox</option>
            <option value="production">Production</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm text-white/70">
          Primary scope
          <select className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-cyan-200/50" onChange={(event) => setScope(event.target.value)} value={scope}>
            {scopeCatalog.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <button className="mt-2 rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60" disabled={busyAction !== null} onClick={() => onCreate(name, environment, [scope, "audit:read"])} type="button">
          {busyAction === "create-key" ? "Creating" : "Create audited key"}
        </button>
      </div>
    </section>
  );
}

