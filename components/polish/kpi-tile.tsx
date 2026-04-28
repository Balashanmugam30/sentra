"use client";

export function KpiTile({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38">{label}</p>
      <p className="mt-3 font-mono text-3xl text-white">{value}</p>
      {detail && <p className="mt-2 text-sm text-white/45">{detail}</p>}
    </div>
  );
}

