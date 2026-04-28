import type { SiteSummary } from "@/lib/site/types";

export function Hero({ summary }: { summary: SiteSummary }) {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-12 pt-12 md:px-8 md:pb-20 md:pt-20">
      <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        <div>
          <div className="mb-5 inline-flex rounded-full border border-cyan-200/20 bg-cyan-200/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/70">
            Global resilience command
          </div>
          <h1 className="max-w-5xl text-5xl font-semibold tracking-[-0.065em] text-white md:text-7xl">{summary.headline}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/58">{summary.subheadline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="rounded-2xl bg-cyan-100 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white" href="/site/request-demo">
              Request demo
            </a>
            <a className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15" href="/demo">
              Watch demo
            </a>
            <a className="rounded-2xl border border-white/15 bg-black/20 px-5 py-3 text-sm font-semibold text-white/75 transition hover:text-white" href="/site/investors">
              Investor portal
            </a>
          </div>
        </div>
        <div className="rounded-[38px] border border-white/10 bg-white/[0.055] p-5 shadow-[0_32px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <div className="relative h-[460px] overflow-hidden rounded-[30px] border border-white/10 bg-[#061019]">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(34,211,238,0.09)_1px,transparent_1px),linear-gradient(rgba(34,211,238,0.08)_1px,transparent_1px)] bg-[size:44px_44px]" />
            <div className="absolute left-[14%] top-[18%] size-36 rounded-full border border-cyan-200/25 bg-cyan-200/10 shadow-[0_0_80px_rgba(34,211,238,0.22)]" />
            <div className="absolute right-[14%] top-[22%] size-28 rounded-full border border-emerald-200/25 bg-emerald-200/10 shadow-[0_0_70px_rgba(16,185,129,0.2)]" />
            <div className="absolute bottom-[18%] left-[35%] size-44 rounded-full border border-amber-200/20 bg-amber-200/10 shadow-[0_0_90px_rgba(245,158,11,0.18)]" />
            <div className="absolute inset-x-7 bottom-7 rounded-3xl border border-white/10 bg-black/45 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/55">Live command twin</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {summary.live_metrics.slice(0, 3).map((metric) => (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4" key={metric.label}>
                    <p className="text-xs text-white/45">{metric.label}</p>
                    <p className="mt-2 font-mono text-2xl text-white">{metric.value}{metric.unit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
