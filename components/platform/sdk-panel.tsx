"use client";

import { platformStatusTone } from "@/lib/platform/runtime";
import type { PlatformDocsState, PlatformSdksState } from "@/lib/platform/types";

export function SdkPanel({ sdks, docs }: { sdks: PlatformSdksState; docs: PlatformDocsState }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">SDK Readiness</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Docs-ready builder surface</h3>
        </div>
        <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100">
          OpenAPI {docs.openapi_ready ? "ready" : "review"}
        </span>
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {sdks.packages.map((sdk) => (
          <article className="rounded-2xl border border-white/10 bg-black/20 p-4" key={sdk.sdk_id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{sdk.name}</p>
                <p className="mt-1 font-mono text-xs text-white/40">{sdk.language} / v{sdk.version}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs ${platformStatusTone(sdk.status)}`}>{sdk.status}</span>
            </div>
            <p className="mt-4 rounded-xl bg-white/[0.04] px-3 py-2 font-mono text-xs text-cyan-100/75">{sdk.example}</p>
            <p className="mt-3 text-xs text-white/45">{sdk.downloads.toLocaleString()} downloads</p>
          </article>
        ))}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {docs.docs.map((doc) => (
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4" key={doc.doc_id}>
            <p className="text-sm font-semibold text-white">{doc.title}</p>
            <p className="mt-2 text-xs text-white/45">{doc.section} / {doc.views} views</p>
          </div>
        ))}
      </div>
    </section>
  );
}

