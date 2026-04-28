import type { IotVisionData } from "@/lib/iot/types";

export function VisionPanel({ data }: { data: IotVisionData }) {
  return (
    <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <div className="rounded-[34px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/65">Privacy Guardrails</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">Public-zone intelligence only</h2>
        <div className="mt-6 grid gap-3">
          {data.privacy_rules.map((rule) => (
            <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4 text-sm font-semibold text-cyan-50/75" key={rule}>
              {rule.replaceAll("_", " ")}
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/55">
          Face recognition: <strong className="text-white">{String(data.inference_pipeline.face_recognition)}</strong>
          <br />
          Room surveillance: <strong className="text-white">{String(data.inference_pipeline.room_surveillance)}</strong>
          <br />
          Edge blur: <strong className="text-white">{String(data.inference_pipeline.edge_blur_enabled)}</strong>
        </div>
      </div>
      <div className="grid gap-4">
        {data.camera_zones.map((zone) => (
          <article className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)]" key={zone.camera_id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/55">{zone.camera_id}</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{zone.zone}</h3>
              </div>
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-white/65">
                visibility {zone.visibility}%
              </span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
              {[
                ["Smoke", `${zone.smoke_confidence}%`],
                ["Crowd", `${zone.crowd_density}%`],
                ["Blocked Exit", zone.blocked_exit ? "Yes" : "No"],
                ["Slip/Fall", zone.slip_fall ? "Watch" : "Clear"],
                ["Queue", `${zone.queue_congestion}%`],
              ].map(([label, value]) => (
                <div className="rounded-2xl bg-black/20 p-3" key={label}>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">{label}</p>
                  <p className="mt-1 font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
