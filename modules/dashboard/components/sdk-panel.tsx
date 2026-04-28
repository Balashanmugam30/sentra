"use client";

import { useDeveloper } from "@/lib/developer/use-developer";

export function SdkPanel() {
  const { sdk, widgets } = useDeveloper();

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">SDK and Embeds</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Developer adoption paths and public widgets</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {(sdk?.sdks ?? []).map((item, index) => (
          <div className="rounded-[20px] border border-white/10 bg-white/[0.045] p-4" key={`${item.language}-${index}`}>
            <p className="font-semibold text-white">{item.language}</p>
            <p className="mt-1 font-mono text-xs text-cyan-50/70">{item.package}</p>
            <p className="mt-2 text-xs text-white/45">{item.status}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {(widgets?.widgets ?? []).map((widget, index) => (
          <span className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1 text-xs text-white/70" key={`${widget.widget_id}-${index}`}>
            {widget.name}
          </span>
        ))}
      </div>
    </section>
  );
}

