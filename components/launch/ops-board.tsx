import { LaunchPanel } from "@/components/launch/launch-panel";
import type { LaunchOps } from "@/lib/launch/types";

export function OpsBoard({ ops }: { ops: LaunchOps }) {
  return (
    <LaunchPanel eyebrow="Observability UI" title="Uptime, background jobs, queue depth, retries, degraded services, and alert history">
      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <div className="grid gap-3 md:grid-cols-2">
          {ops.signals.map((signal) => (
            <article className="rounded-3xl border border-white/10 bg-black/25 p-5" key={signal.signal_id}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-white">{signal.label}</p>
                <span className="rounded-full border border-emerald-200/20 bg-emerald-200/10 px-3 py-1 text-xs text-emerald-100">{signal.status}</span>
              </div>
              <p className="mt-3 font-mono text-3xl text-white">{signal.value}{signal.unit}</p>
              <p className="mt-3 text-sm leading-6 text-white/55">{signal.detail}</p>
            </article>
          ))}
        </div>
        <div className="space-y-3">
          {ops.alert_history.map((alert) => (
            <article className="rounded-2xl border border-white/10 bg-black/25 p-4" key={alert.alert_id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold text-white">{alert.title}</p>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/55">{alert.status}</span>
              </div>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/35">{alert.severity}</p>
            </article>
          ))}
        </div>
      </div>
    </LaunchPanel>
  );
}
