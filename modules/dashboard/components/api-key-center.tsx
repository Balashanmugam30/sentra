"use client";

import { useDeveloper } from "@/lib/developer/use-developer";

export function ApiKeyCenter() {
  const { busyAction, createKey, keys } = useDeveloper();

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">API Key Center</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Scoped tenant API credentials</h2>
        </div>
        <button
          className="rounded-full border border-cyan-200/22 bg-cyan-200/10 px-4 py-2 text-sm font-semibold text-cyan-50 disabled:opacity-50"
          disabled={busyAction === "create-key"}
          onClick={() => void createKey()}
          type="button"
        >
          {busyAction === "create-key" ? "Creating..." : "Create Key"}
        </button>
      </div>
      <div className="mt-5 grid gap-3">
        {(keys?.keys ?? []).map((key, index) => (
          <article className="rounded-[20px] border border-white/10 bg-white/[0.045] p-4" key={`${key.key_id}-${index}`}>
            <p className="font-semibold text-white">{key.label}</p>
            <p className="mt-1 font-mono text-xs text-cyan-50/70">{key.masked_key}</p>
            <p className="mt-2 text-xs text-white/45">{key.scopes.join(", ")} - {key.rate_limit.toLocaleString()} rpm</p>
          </article>
        ))}
      </div>
    </section>
  );
}

