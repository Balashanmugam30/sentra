import { LaunchPanel } from "@/components/launch/launch-panel";
import type { LaunchQuality } from "@/lib/launch/types";

export function QualityBoard({ quality, busyAction, onScan }: { quality: LaunchQuality; busyAction: string | null; onScan: () => void }) {
  return (
    <LaunchPanel eyebrow="Zero Bug Hardening" title="Route scanner, console tracker, API panel, polling warnings, auth loops, and mobile checks" subtitle={quality.degraded_mode}>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <button className="rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60" disabled={busyAction !== null} onClick={onScan} type="button">
          Run launch scan
        </button>
        <span className="rounded-full border border-white/10 bg-black/25 px-3 py-2 text-sm text-white/55">{quality.open_items} open watch items</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {quality.checks.map((check) => (
          <article className="rounded-3xl border border-white/10 bg-black/25 p-5" key={check.check_id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-lg font-semibold text-white">{check.name}</p>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${check.status === "pass" ? "border-emerald-200/20 bg-emerald-200/10 text-emerald-100" : "border-amber-200/20 bg-amber-200/10 text-amber-100"}`}>
                {check.status}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/55">{check.detail}</p>
            <p className="mt-3 font-mono text-sm text-white/45">{check.count} findings | {check.severity}</p>
          </article>
        ))}
      </div>
    </LaunchPanel>
  );
}
