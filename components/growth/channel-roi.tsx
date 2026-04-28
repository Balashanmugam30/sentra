import { formatCurrency } from "@/lib/revenue/helpers";
import type { ChannelRoi } from "@/lib/growth/types";

type ChannelRoiProps = {
  channels: ChannelRoi[];
  leaks: string[];
};

export function ChannelRoi({ channels, leaks }: ChannelRoiProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-purple-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-200/70">Channel ROI</p>
      <div className="mt-4 grid gap-3">
        {channels.map((channel) => (
          <article key={channel.source} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{channel.source}</p>
                <p className="text-xs text-slate-500">{channel.leads.toLocaleString()} leads · CAC {formatCurrency(channel.cac)}</p>
              </div>
              <span className="text-xl font-black text-emerald-100">{channel.roi}x</span>
            </div>
            <p className="mt-3 text-sm text-slate-300">Pipeline: {formatCurrency(channel.pipeline_value)} · close rate {channel.close_rate}%</p>
          </article>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-100">Dropoff leaks</p>
        <div className="mt-2 space-y-2">
          {leaks.map((leak) => (
            <p key={leak} className="text-sm leading-6 text-amber-50/90">{leak}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

