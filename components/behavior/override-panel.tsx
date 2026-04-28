type OverridePanelProps = {
  options: string[];
  busy?: boolean;
  onOverride?: (reason: string) => void;
};

export function OverridePanel({ options, busy = false, onOverride }: OverridePanelProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Override center</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onOverride?.(option)}
            disabled={busy}
            className="rounded-3xl border border-white/10 bg-black/20 p-4 text-left text-sm font-semibold text-white transition hover:border-rose-300/40 hover:bg-rose-400/10 disabled:opacity-60"
          >
            {option}
          </button>
        ))}
      </div>
    </section>
  );
}
