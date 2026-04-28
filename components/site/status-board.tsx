import type { SiteStatus } from "@/lib/site/types";

export function StatusBoard({ status }: { status: SiteStatus }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="rounded-[32px] border border-emerald-200/15 bg-emerald-200/[0.055] p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-emerald-100/55">Public trust status</p>
        <p className="mt-5 font-mono text-6xl text-emerald-100">{status.uptime}%</p>
        <p className="mt-3 text-sm text-white/56">Platform health: {status.platform_health}</p>
        <p className="mt-2 text-sm text-white/56">{status.compliance_posture}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {status.systems.map((system) => (
          <article className="rounded-3xl border border-white/10 bg-white/[0.045] p-5" key={system.name}>
            <div className="flex items-center justify-between gap-4">
              <p className="font-semibold text-white">{system.name}</p>
              <span className="rounded-full border border-emerald-200/20 bg-emerald-200/10 px-3 py-1 text-xs text-emerald-100">{system.status}</span>
            </div>
            <p className="mt-4 font-mono text-2xl text-white">{system.latency_ms}ms</p>
          </article>
        ))}
      </div>
    </div>
  );
}
