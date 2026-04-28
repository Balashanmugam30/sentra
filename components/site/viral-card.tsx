export function ViralCard({ title, metric, body, cta }: { title: string; metric: string; body: string; cta: string }) {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-86px)] max-w-5xl place-items-center px-5 py-16 text-center md:px-8">
      <div className="rounded-[42px] border border-white/10 bg-white/[0.055] p-8 shadow-[0_40px_140px_rgba(0,0,0,0.5)] backdrop-blur-2xl md:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-100/60">Sentra showcase</p>
        <h1 className="mt-5 text-5xl font-semibold tracking-[-0.06em] text-white md:text-7xl">{title}</h1>
        <p className="mt-7 font-mono text-6xl text-cyan-100 md:text-8xl">{metric}</p>
        <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-white/58">{body}</p>
        <a className="mt-8 inline-flex rounded-2xl bg-cyan-100 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white" href="/site/request-demo">
          {cta}
        </a>
      </div>
    </section>
  );
}
