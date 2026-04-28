import { isIotAlertRecord, type IotEventRecord } from "@/lib/iot/types";
import { cn } from "@/lib/utils";

function formatTime(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function eventTitle(event: IotEventRecord) {
  if (isIotAlertRecord(event)) {
    return event.message;
  }
  if (event.button_pressed) {
    return "Emergency button pressed";
  }
  if (event.flame_detected) {
    return "Flame detected by utility node";
  }
  if ((event.gas_level ?? 0) >= 2350) {
    return "Dangerous gas level detected";
  }
  if ((event.gas_level ?? 0) >= 1350) {
    return "Gas level elevated";
  }
  return "Telemetry heartbeat received";
}

export function AlertStream({ events }: { events: IotEventRecord[] }) {
  const recentEvents = events.slice(0, 10);

  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/60">Live Event Feed</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Edge telemetry stream</h2>
        </div>
        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100">
          {recentEvents.length} events
        </span>
      </div>

      <div className="mt-5 grid gap-3">
        {recentEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-5 text-sm leading-6 text-white/55">
            No live telemetry received yet. Flash the ESP32 firmware, point it to
            <span className="font-semibold text-cyan-100"> /api/iot/telemetry</span>, and the stream will populate automatically.
          </div>
        ) : (
          recentEvents.map((event) => (
            <article key={event.event_id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{eventTitle(event)}</p>
                  <p className="mt-1 text-xs text-white/45">
                    {event.node_id} - {formatTime(event.timestamp)}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full border px-3 py-1 text-[11px] font-bold uppercase",
                    event.risk_level === "SAFE" && "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
                    event.risk_level === "WARNING" && "border-amber-300/30 bg-amber-400/10 text-amber-100",
                    (event.risk_level === "CRITICAL" || event.risk_level === "CRITICAL+") &&
                      "border-red-300/35 bg-red-500/15 text-red-100",
                  )}
                >
                  {event.risk_level}
                </span>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
