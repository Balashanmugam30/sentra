import type { IotFirmwareData } from "@/lib/iot/types";

export function FirmwareRollout({
  data,
  busy,
  onRelease,
  onRollback,
}: {
  data: IotFirmwareData;
  busy: boolean;
  onRelease: (version: string, target: string) => void;
  onRollback: () => void;
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-[34px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/65">OTA Firmware Center</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">Release control and canary rollout</h2>
        <div className="mt-6 grid gap-4">
          {data.available_releases.map((release) => (
            <article className="rounded-3xl border border-white/10 bg-black/20 p-4" key={release.version}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-lg font-semibold text-white">{release.version}</p>
                  <p className="mt-1 text-sm text-cyan-100/60">{release.target} - {release.status}</p>
                  <p className="mt-3 text-sm leading-6 text-white/55">{release.notes}</p>
                </div>
                <button
                  className="rounded-2xl bg-cyan-100 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-50"
                  disabled={busy}
                  onClick={() => onRelease(release.version, release.target)}
                  type="button"
                >
                  Canary 10%
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        <div className="rounded-[34px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/65">Active Rollout</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{data.rollout.active_version}</h3>
          <div className="mt-5 h-3 rounded-full bg-black/30">
            <div className="h-full rounded-full bg-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.35)]" style={{ width: `${data.rollout.rollout_percentage}%` }} />
          </div>
          <p className="mt-3 text-sm text-white/55">{data.rollout.rollout_percentage}% rollout - rollback to {data.rollout.rollback_available}</p>
          <button
            className="mt-5 rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/15 disabled:opacity-50"
            disabled={busy}
            onClick={onRollback}
            type="button"
          >
            Rollback firmware
          </button>
        </div>
        <div className="rounded-[34px] border border-white/10 bg-white/[0.045] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-red-200/65">Failed Upgrades</p>
          <div className="mt-4 grid gap-3">
            {data.failed_upgrades.map((item) => (
              <div className="rounded-2xl border border-red-300/20 bg-red-500/10 p-4" key={item.node_id}>
                <p className="font-semibold text-white">{item.node_id}</p>
                <p className="mt-1 text-sm text-red-100/70">{item.reason} - {item.retry_window}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
