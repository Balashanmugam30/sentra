import Link from "next/link";

type AccessGateProps = {
  reason?: string;
};

export function AccessGate({ reason = "Your current role does not include this command surface." }: AccessGateProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05070B] px-6 py-16 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(110,168,255,0.16),transparent_28%),radial-gradient(circle_at_82%_0%,rgba(139,92,246,0.12),transparent_30%),linear-gradient(180deg,#05070B_0%,#090D16_100%)]" />
      <section className="relative z-10 w-full max-w-xl overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.055] p-8 text-center shadow-[0_34px_100px_rgba(0,0,0,0.44)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-cyan-200/20 bg-cyan-200/10 text-cyan-50">
          <svg
            aria-hidden="true"
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            viewBox="0 0 24 24"
          >
            <path d="M7 11V8a5 5 0 0 1 10 0v3" />
            <path d="M6 11h12v9H6z" />
          </svg>
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/62">
          Access controlled
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
          This area is protected
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/60">
          {reason} Sentra kept the product stable and blocked the route before sensitive data loaded.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            className="inline-flex h-11 items-center justify-center rounded-full border border-cyan-200/26 bg-cyan-200/14 px-5 text-sm font-semibold text-cyan-50 transition hover:-translate-y-0.5 hover:bg-cyan-200/20"
            href="/app"
          >
            Return home
          </Link>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] px-5 text-sm font-semibold text-white/74 transition hover:-translate-y-0.5 hover:bg-white/10"
            href="/cloud/tenants"
          >
            Switch workspace
          </Link>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 px-5 text-sm font-semibold text-white/62 transition hover:-translate-y-0.5 hover:bg-white/8"
            href="/login"
          >
            Switch account
          </Link>
        </div>
      </section>
    </main>
  );
}
