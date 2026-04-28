"use client";

export function ScreenplayCaptions({ captions, activeIndex }: { captions: string[]; activeIndex: number }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-black/35 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">Voice / screenplay mode</p>
      <div className="mt-4 space-y-3">
        {captions.slice(Math.max(0, activeIndex - 1), activeIndex + 2).map((caption, index) => (
          <p className={`rounded-3xl border p-4 text-sm leading-6 ${index === 1 || (activeIndex === 0 && index === 0) ? "border-cyan-200/35 bg-cyan-200/10 text-white" : "border-white/10 bg-white/[0.03] text-white/45"}`} key={caption}>
            {caption}
          </p>
        ))}
      </div>
    </section>
  );
}

