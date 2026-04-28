import type { IotLaunchData } from "@/lib/iot/types";

export function InvestorPanel({ data }: { data: IotLaunchData }) {
  const maxArr = Math.max(...data.arr_forecast.map((item) => item.arr));

  return (
    <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[36px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.32)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Startup Wow Mode</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white">Hardware-light smart safety SaaS.</h2>
        <div className="mt-6 grid gap-3">
          <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/60">TAM</p>
            <p className="mt-2 text-3xl font-semibold text-white">{data.tam}</p>
          </div>
          <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-100/60">SAM</p>
            <p className="mt-2 text-3xl font-semibold text-white">{data.sam}</p>
          </div>
        </div>
      </div>
      <div className="grid gap-4">
        <div className="rounded-[34px] border border-white/10 bg-white/[0.045] p-6">
          <h3 className="text-2xl font-semibold text-white">ARR forecast</h3>
          <div className="mt-6 flex h-56 items-end gap-3">
            {data.arr_forecast.map((item) => (
              <div className="flex flex-1 flex-col items-center gap-2" key={item.year}>
                <div className="flex h-44 w-full items-end rounded-full bg-black/25 p-1">
                  <div className="w-full rounded-full bg-cyan-300 shadow-[0_0_28px_rgba(34,211,238,0.3)]" style={{ height: `${(item.arr / maxArr) * 100}%` }} />
                </div>
                <span className="text-xs text-white/45">{item.year}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {data.moats.map((moat) => (
            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 text-sm leading-6 text-white/60" key={moat}>
              {moat}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
