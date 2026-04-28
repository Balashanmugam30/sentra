import type { IotCameraLatestResponse } from "@/lib/iot/types";

function formatCaptureTime(value: string | null | undefined) {
  if (!value) {
    return "No capture received yet";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Capture timestamp unavailable";
  }
  return date.toLocaleString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function CameraFeedCard({ camera }: { camera: IotCameraLatestResponse | null }) {
  const feedUrl = camera?.stream_url || camera?.snapshot_url || "";

  return (
    <section className="overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.045] shadow-[0_24px_70px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/60">
            Public Area Verification
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
            {camera?.label ?? "Corridor Verification Camera B"}
          </h2>
          <p className="mt-1 text-sm text-white/50">
            {camera?.building ?? "Grand Meridian Hotel"} - {camera?.zone ?? "Floor 3 Corridor"}
          </p>
        </div>
        <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-bold uppercase text-emerald-100">
          Public zones only
        </span>
      </div>

      <div className="mx-5 mb-5 overflow-hidden rounded-[26px] border border-white/10 bg-black">
        {feedUrl ? (
          <div
            aria-label="ESP32-CAM live feed"
            className="min-h-72 bg-cover bg-center"
            role="img"
            style={{ backgroundImage: `linear-gradient(180deg, transparent, rgba(0,0,0,0.55)), url(${feedUrl})` }}
          />
        ) : (
          <div className="flex min-h-72 flex-col items-center justify-center bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.16),transparent_35%),linear-gradient(135deg,#030712,#020617)] p-8 text-center">
            <div className="h-16 w-16 rounded-full border border-cyan-300/20 bg-cyan-300/10 shadow-[0_0_40px_rgba(34,211,238,0.12)]" />
            <p className="mt-5 text-lg font-semibold text-white">Camera endpoint waiting</p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-white/50">
              Set SENTRA_IOT_CAMERA_STREAM_URL to the ESP32-CAM stream or send a snapshot URL with telemetry.
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 px-5 py-4 text-sm text-white/55">
        Last capture: <span className="font-semibold text-white/80">{formatCaptureTime(camera?.last_capture_at)}</span>
      </div>
    </section>
  );
}
