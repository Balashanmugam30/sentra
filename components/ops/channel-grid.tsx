import { getChannelTone } from "@/lib/ops/communications";
import type { OpsCommsChannelMetric } from "@/lib/ops/types";

type ChannelGridProps = {
  channels: OpsCommsChannelMetric[];
};

export function ChannelGrid({ channels }: ChannelGridProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-blue-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-100/70">Channel Selector</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Delivery paths</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {channels.map((channel) => (
          <article key={channel.channel} className={`rounded-3xl border p-4 ${getChannelTone(channel)}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{channel.label}</h3>
                <p className="mt-1 text-xs opacity-75">Queued {channel.queued} - retried {channel.retried}</p>
              </div>
              <span className="text-2xl font-black text-white">{channel.success_rate}%</span>
            </div>
            <p className="mt-3 text-sm opacity-80">Delivered {channel.delivered} / Sent {channel.sent}. Acked {channel.acked}.</p>
          </article>
        ))}
      </div>
    </section>
  );
}
