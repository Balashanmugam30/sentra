type PerformanceChipProps = {
  label?: string;
};

export function PerformanceChip({ label = "Fast mobile startup" }: PerformanceChipProps) {
  return (
    <span className="inline-flex min-h-9 items-center rounded-full border border-cyan-300/20 bg-cyan-400/12 px-3 text-xs font-bold uppercase tracking-[0.14em] text-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.1)]">
      {label}
    </span>
  );
}
