import type { IotFeedItem } from "@/lib/iot/types";
import { cn } from "@/lib/utils";

function formatTime(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function LiveFeed({ feed }: { feed: IotFeedItem[] }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/60">Alert Timeline</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Streaming node intelligence</h2>
        </div>
        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100">
          Live
        </span>
      </div>
      <div className="mt-5 grid max-h-[520px] gap-3 overflow-y-auto pr-1">
        {feed.map((item) => (
          <article className="relative rounded-2xl border border-white/10 bg-black/25 p-4" key={item.id}>
            <span
              className={cn(
                "absolute left-0 top-4 h-10 w-1 rounded-r-full",
                item.severity === "SAFE" && "bg-emerald-300",
                item.severity === "WARNING" && "bg-amber-300",
                (item.severity === "CRITICAL" || item.severity === "CRITICAL+") && "bg-red-400",
              )}
            />
            <div className="flex items-start justify-between gap-3 pl-3">
              <div>
                <p className="text-sm font-semibold text-white">{item.message}</p>
                <p className="mt-1 text-xs text-white/40">
                  {item.node_id} - {item.kind} - {formatTime(item.timestamp)}
                </p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[11px] font-bold uppercase text-white/60">
                {item.severity}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
