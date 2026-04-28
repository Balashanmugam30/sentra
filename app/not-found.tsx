import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05070b] px-5 py-12 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(125,211,252,0.14),transparent_32rem),radial-gradient(circle_at_82%_16%,rgba(139,92,246,0.1),transparent_30rem),linear-gradient(180deg,#05070b_0%,#070b14_100%)]" />
      <section className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[38px] border border-white/10 bg-white/[0.055] p-8 text-center shadow-[0_34px_120px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl border border-cyan-100/16 bg-cyan-200/10 text-lg font-semibold text-cyan-50">
          S
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/58">
          Route not found
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em] text-white md:text-5xl">
          This command surface is not available.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/58">
          Sentra kept the experience contained instead of dropping you into a broken route. Return to the launch showcase or open the protected app workspace.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            className="inline-flex items-center justify-center rounded-full border border-cyan-100/20 bg-cyan-200/12 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-100/18"
            href="/landing"
          >
            View launch showcase
          </Link>
          <Link
            className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.045] px-5 py-3 text-sm font-semibold text-white/76 transition hover:bg-white/[0.08] hover:text-white"
            href="/login"
          >
            Open Sentra
          </Link>
        </div>
      </section>
    </main>
  );
}
