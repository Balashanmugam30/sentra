"use client";

import type { PlatformSandboxState } from "@/lib/platform/types";

export function SandboxLab({ sandbox }: { sandbox: PlatformSandboxState }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-gradient-to-br from-emerald-300/10 via-white/[0.045] to-cyan-300/10 p-5 backdrop-blur-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">Sandbox Mode</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">Safe external integration lab</h3>
      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        {sandbox.events.map((event) => (
          <article className="rounded-2xl border border-white/10 bg-black/25 p-4" key={event.event_id}>
            <p className="font-semibold text-white">{event.name}</p>
            <pre className="mt-3 max-h-32 overflow-hidden rounded-xl bg-black/40 p-3 text-xs text-cyan-100/75">
              {JSON.stringify(event.payload, null, 2)}
            </pre>
            <p className="mt-3 text-xs text-white/45">{event.status}</p>
          </article>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {sandbox.mock_incidents.map((incident) => (
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/55" key={incident}>{incident}</span>
        ))}
      </div>
    </section>
  );
}

